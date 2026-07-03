import { Submission } from '../../../models/db.types';

export interface TranslationOutput {
  detectedLanguage: string;
  englishTranslation: string;
  confidence: number;
}

export interface ImageUnderstandingOutput {
  ocrText: string;
  visualSummary: string;
  confidence: number;
}

export interface AudioUnderstandingOutput {
  transcript: string;
  confidence: number;
}

export interface SentimentUrgencyOutput {
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: Submission['urgency'];
  urgencyReasoning: string;
  evidence: string[];
  confidence: number;
}

export interface DuplicateClusteringOutput {
  isDuplicate: boolean;
  duplicateGroupId?: string;
  matchingComplaints: { id: string; similarityScore: number }[];
  confidence: number;
}

export interface SchemeSDGOutput {
  suggestedSchemes: string[];
  sdgMapping: string[];
  confidence: number;
}

export interface PriorityScoreOutput {
  priorityScore: number;
  infrastructureGapIndex: number;
  affectedPopulation: number;
  reasoning: string;
  confidence: number;
}
