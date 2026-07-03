import { db } from '../../config/firebase';
import { Submission, PublicDataset } from '../../models/db.types';
import { runTranslationAgent } from './agents/translation.agent';
import { runOCRAgent } from './agents/ocr.agent';
import { runAudioAgent } from './agents/audio.agent';
import { runSentimentAgent } from './agents/sentiment.agent';
import { runDuplicateAgent } from './agents/duplicate.agent';
import { runSchemeAgent } from './agents/scheme.agent';
import { runPriorityAgent } from './agents/priority.agent';

export interface AIOrchestrationResult {
  category: Submission['category'];
  urgency: Submission['urgency'];
  priorityScore: number;
  confidenceScore: number;
  aiAnalysis: Submission['aiAnalysis'];
}

export const runAIOrchestrator = async (
  title: string,
  description: string,
  imagePath?: string,
  audioPath?: string
): Promise<AIOrchestrationResult> => {
  const stepStartTime = Date.now();

  try {
    // 1. Language Detection & Translation
    const translationResult = await runTranslationAgent(title, description);

    // 2. Multimodal OCR Visual Understanding
    const ocrResult = await runOCRAgent(imagePath);

    // 3. Audio / Speech Transcription
    const audioResult = await runAudioAgent(audioPath);

    // Synthesize combined English content for context analysis
    let combinedContent = translationResult.englishTranslation;
    if (ocrResult.ocrText) {
      combinedContent += ` [Image text: ${ocrResult.ocrText}]`;
    }
    if (ocrResult.visualSummary) {
      combinedContent += ` [Image description: ${ocrResult.visualSummary}]`;
    }
    if (audioResult.transcript) {
      combinedContent += ` [Voice description: ${audioResult.transcript}]`;
    }

    // 4. Sentiment & Urgency analysis
    const sentimentResult = await runSentimentAgent(combinedContent);

    // Heuristically map title and description to primary categories
    let category: Submission['category'] = 'Other';
    const textLower = combinedContent.toLowerCase();
    if (textLower.includes('road') || textLower.includes('highway') || textLower.includes('pothole') || textLower.includes('street')) {
      category = 'Roads & Transport';
    } else if (textLower.includes('water') || textLower.includes('pipe') || textLower.includes('leak') || textLower.includes('drain')) {
      category = 'Water Supply';
    } else if (textLower.includes('power') || textLower.includes('electricity') || textLower.includes('light') || textLower.includes('wire')) {
      category = 'Electricity & Power';
    } else if (textLower.includes('garbage') || textLower.includes('waste') || textLower.includes('sewage') || textLower.includes('toilet') || textLower.includes('sanitation')) {
      category = 'Sanitation & Waste';
    } else if (textLower.includes('hospital') || textLower.includes('clinic') || textLower.includes('doctor') || textLower.includes('health')) {
      category = 'Healthcare';
    } else if (textLower.includes('school') || textLower.includes('class') || textLower.includes('teacher') || textLower.includes('education')) {
      category = 'Education';
    } else if (textLower.includes('park') || textLower.includes('play') || textLower.includes('market') || textLower.includes('public')) {
      category = 'Public Spaces';
    }

    // 5. Duplicate Detection & Grouping
    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    const duplicateResult = await runDuplicateAgent(tempId, combinedContent, category);

    // 6. Public Dataset Gap Analysis (fetch region gaps)
    const datasets = await db.getCollection('publicDatasets') as PublicDataset[];
    const gaps = datasets.length > 0 && datasets[0].gaps 
      ? Object.values(datasets[0].gaps).flat().join(', ')
      : 'Water supply pipeline leaks, road repair backlogs, electricity grid expansions';

    // 7. Welfare Scheme & SDG Matching
    const schemeResult = await runSchemeAgent(combinedContent, category);

    // 8. Priority Score Calculator
    const priorityResult = await runPriorityAgent(
      category,
      sentimentResult.urgency,
      duplicateResult.matchingComplaints.length,
      gaps
    );

    // Compute aggregate confidence score
    const avgConfidence = Math.round(
      (translationResult.confidence + 
       ocrResult.confidence + 
       audioResult.confidence + 
       sentimentResult.confidence + 
       duplicateResult.confidence + 
       schemeResult.confidence + 
       priorityResult.confidence) / 7
    );

    const executionTimeMs = Date.now() - stepStartTime;
    console.log(`⏱️ AI Orchestrator completed pipeline in ${executionTimeMs}ms (Confidence: ${avgConfidence}%)`);

    return {
      category,
      urgency: sentimentResult.urgency,
      priorityScore: priorityResult.priorityScore,
      confidenceScore: avgConfidence,
      aiAnalysis: {
        detectedLanguage: translationResult.detectedLanguage,
        englishTranslation: translationResult.englishTranslation,
        summary: combinedContent.length > 300 ? combinedContent.substring(0, 300) + '...' : combinedContent,
        sentiment: sentimentResult.sentiment,
        urgencyReasoning: sentimentResult.urgencyReasoning,
        ocrResult: ocrResult.ocrText || undefined,
        audioTranscript: audioResult.transcript || undefined,
        suggestedSchemes: schemeResult.suggestedSchemes,
        isDuplicate: duplicateResult.isDuplicate,
        duplicateGroupId: duplicateResult.duplicateGroupId,
        evidence: sentimentResult.evidence,
        uncertaintyLevel: avgConfidence > 80 ? 'low' : avgConfidence > 50 ? 'medium' : 'high'
      }
    };
  } catch (error) {
    console.error('AI Pipeline Orchestrator Error:', error);
    return {
      category: 'Other',
      urgency: 'medium',
      priorityScore: 40,
      confidenceScore: 50,
      aiAnalysis: {
        detectedLanguage: 'English',
        englishTranslation: description,
        summary: description,
        sentiment: 'neutral',
        urgencyReasoning: 'Standard priority due to orchestrator error.',
        suggestedSchemes: ['MPLADS'],
        isDuplicate: false,
        evidence: [],
        uncertaintyLevel: 'high'
      }
    };
  }
};
