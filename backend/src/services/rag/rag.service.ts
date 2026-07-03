import { genAI, isGeminiActive } from '../../config/gemini';
import { RAGDocument } from '../../models/db.types';

// Predefined policy documents matching national schemes
const POLICY_KNOWLEDGE_BASE: Omit<RAGDocument, 'id'>[] = [
  {
    title: 'MPLADS Guidelines Section 3.1 (Permissible Works)',
    content: 'Members of Parliament Local Area Development Scheme allows MPs to recommend works of developmental nature with emphasis on the creation of durable community assets based on local needs. Priorities include drinking water, primary education, public health, sanitation, and roads.',
    source: 'MPLADS Master Guidelines 2023',
    category: 'General'
  },
  {
    title: 'PMGSY Road Connectivity Guidelines Section 4',
    content: 'Pradhan Mantri Gram Sadak Yojana aims to provide all-weather road connectivity to unconnected habitations. Eligible habitations include those with a population of 500+ in plain areas, and 250+ in hill, desert, or tribal areas. Upgradation of existing rural roads is allowed if they connect key agricultural markets.',
    source: 'PMGSY Policy Circular 2021',
    category: 'Roads & Transport'
  },
  {
    title: 'Jal Jeevan Mission Guidelines Section 2 (Rural Water Grid)',
    content: 'Jal Jeevan Mission aims to assist and facilitate states in providing Functional Household Tap Connections (FHTC) to every rural home by 2024. Funding ratio is 50:50 between Centre and States, except Himalayan/NE states (90:10). Priority is placed on dry zones, SC/ST dominated villages, and water quality-affected areas.',
    source: 'Jal Jeevan Operational Guidelines',
    category: 'Water Supply'
  },
  {
    title: 'Deen Dayal Upadhyaya Gram Jyoti Yojana (Electricity grid expansion)',
    content: 'DDUGJY targets rural electricity infrastructure: feeder separation, strengthening sub-transmission networks, and micro-grid installations. Funding supports transformers, high-tension wire replacements, and agricultural feeder separation.',
    source: 'Ministry of Power Circular 2020',
    category: 'Electricity & Power'
  },
  {
    title: 'Swachh Bharat Mission Guidelines Section 5 (Sanitation and Waste)',
    content: 'Swachh Bharat Abhiyan supports individual household toilet construction (incentive of Rs 12,000) and Community Sanitary Complexes (CSCs). Funding is also allocated to Solid and Liquid Waste Management (SLWM) in villages and urban wards.',
    source: 'SBM Operational Guidelines 2022',
    category: 'Sanitation & Waste'
  },
  {
    title: 'National Health Mission Infrastructure Gaps',
    content: 'The National Health Mission guidelines approve funds to establish Sub-Centers (one per 5,000 population in plains, 3,000 in hills), Primary Health Centers (PHCs, one per 30,000 in plains), and Community Health Centers (CHCs) with essential beds and diagnostic labs.',
    source: 'NHM Infrastructure Framework',
    category: 'Healthcare'
  },
  {
    title: 'Samagra Shiksha Infrastructure Allocation',
    content: 'Under Samagra Shiksha, central grants are provided to construct classrooms, composite science laboratories, computer rooms, library rooms, and drinking water facilities. Mandatory funding is reserved to ensure separate toilets for boys and girls.',
    source: 'Samagra Shiksha Allocation Guidelines',
    category: 'Education'
  },
  {
    title: 'Smart Cities Mission Guidelines Section 3 (Urban Infrastructure)',
    content: 'Aims to drive economic growth and improve quality of life by enabling local development and harnessing technology. Core elements: adequate water supply, electricity, sanitation, public transport, affordable housing, IT connectivity, and e-governance.',
    source: 'Smart Cities Scheme Guidelines',
    category: 'Public Spaces'
  }
];

// Helper for Vector Cosine Similarity
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

// Fallback Word Overlap scorer (TF-IDF keyword similarity)
const getKeywordSimilarity = (textA: string, textB: string): number => {
  const getWords = (t: string) => new Set(t.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const setA = getWords(textA);
  const setB = getWords(textB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

// Embedding Fetcher
const getGeminiEmbedding = async (text: string): Promise<number[] | null> => {
  if (!isGeminiActive || !genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('RAG Service: Embedding Generation failed:', error);
    return null;
  }
};

class RAGService {
  private documents: RAGDocument[] = [];

  constructor() {
    // Populate database documents with unique IDs
    this.documents = POLICY_KNOWLEDGE_BASE.map((doc, idx) => ({
      id: `doc_${idx + 1}`,
      ...doc
    }));
  }

  public async queryKnowledgeBase(
    queryText: string,
    categoryFilter?: string
  ): Promise<(RAGDocument & { similarity: number })[]> {
    const results: (RAGDocument & { similarity: number })[] = [];
    const queryEmbedding = await getGeminiEmbedding(queryText);

    let targetDocs = this.documents;
    if (categoryFilter && categoryFilter !== 'Other' && categoryFilter !== 'General') {
      // Prioritize same category but keep General guidelines (like MPLADS) in the loop
      targetDocs = this.documents.filter(d => d.category === categoryFilter || d.category === 'General');
    }

    for (const doc of targetDocs) {
      let similarity = 0;
      if (queryEmbedding) {
        const docEmbedding = await getGeminiEmbedding(doc.content);
        if (docEmbedding) {
          similarity = cosineSimilarity(queryEmbedding, docEmbedding);
        } else {
          similarity = getKeywordSimilarity(queryText, doc.content);
        }
      } else {
        similarity = getKeywordSimilarity(queryText, doc.content);
      }
      results.push({ ...doc, similarity });
    }

    // Sort by similarity descending and return top 3 matches
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }
}

export const ragService = new RAGService();
export { POLICY_KNOWLEDGE_BASE };
