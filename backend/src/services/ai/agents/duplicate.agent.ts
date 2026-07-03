import { db } from '../../../config/firebase';
import { Submission, DuplicateGroup } from '../../../models/db.types';
import { DuplicateClusteringOutput } from './agent.types';
import { genAI, isGeminiActive } from '../../../config/gemini';

// Helper function to calculate vector cosine similarity
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Fallback Word Overlap similarity calculator (Heuristic TF-IDF)
const getKeywordSimilarity = (textA: string, textB: string): number => {
  const getWords = (t: string) => new Set(t.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const setA = getWords(textA);
  const setB = getWords(textB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

// Generates embedding vector via Gemini API
const getGeminiEmbedding = async (text: string): Promise<number[] | null> => {
  if (!isGeminiActive || !genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding Generation Error:', error);
    return null;
  }
};

export const runDuplicateAgent = async (
  newSubmissionId: string,
  newText: string,
  category: string
): Promise<DuplicateClusteringOutput> => {
  try {
    const submissions = await db.getCollection('submissions') as Submission[];
    const sameCategorySubs = submissions.filter(s => s.category === category && s.id !== newSubmissionId);

    const matchingComplaints: { id: string; similarityScore: number }[] = [];
    const threshold = 0.7; // similarity threshold for duplicates

    // Try embedding route first if Gemini is active
    const newEmbedding = await getGeminiEmbedding(newText);

    for (const sub of sameCategorySubs) {
      let score = 0;
      if (newEmbedding) {
        // Try to generate/fetch target embedding
        const targetEmbedding = await getGeminiEmbedding(sub.description);
        if (targetEmbedding) {
          score = cosineSimilarity(newEmbedding, targetEmbedding);
        } else {
          score = getKeywordSimilarity(newText, sub.description);
        }
      } else {
        score = getKeywordSimilarity(newText, sub.description);
      }

      if (score >= threshold) {
        matchingComplaints.push({ id: sub.id, similarityScore: Math.round(score * 100) });
      }
    }

    const isDuplicate = matchingComplaints.length > 0;
    let duplicateGroupId: string | undefined = undefined;

    if (isDuplicate) {
      // Find if any matched complaint already belongs to a DuplicateGroup
      const matchedWithGroup = sameCategorySubs.find(s => s.id === matchingComplaints[0].id && s.aiAnalysis.duplicateGroupId);
      if (matchedWithGroup && matchedWithGroup.aiAnalysis.duplicateGroupId) {
        duplicateGroupId = matchedWithGroup.aiAnalysis.duplicateGroupId;
        
        // Add current submission to group
        const group = await db.getDoc('duplicateGroups', duplicateGroupId) as DuplicateGroup;
        if (group) {
          const submissionIds = [...new Set([...group.submissionIds, newSubmissionId])];
          await db.updateDoc('duplicateGroups', duplicateGroupId, { submissionIds });
        }
      } else {
        // Create new DuplicateGroup
        duplicateGroupId = 'group_' + Math.random().toString(36).substr(2, 9);
        const newGroup: DuplicateGroup = {
          id: duplicateGroupId,
          primarySubmissionId: matchingComplaints[0].id,
          submissionIds: [matchingComplaints[0].id, newSubmissionId],
          category,
          createdAt: new Date().toISOString()
        };
        await db.addDoc('duplicateGroups', duplicateGroupId, newGroup);
        
        // Update primary submission with duplicateGroupId
        await db.updateDoc('submissions', matchingComplaints[0].id, {
          'aiAnalysis.duplicateGroupId': duplicateGroupId,
          'aiAnalysis.isDuplicate': true
        });
      }
    }

    return {
      isDuplicate,
      duplicateGroupId,
      matchingComplaints,
      confidence: 85
    };
  } catch (error) {
    console.error('Duplicate Detection Agent Error:', error);
    return {
      isDuplicate: false,
      matchingComplaints: [],
      confidence: 50
    };
  }
};
