export interface User {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  role: 'citizen' | 'mp' | 'officer' | 'admin';
  constituency: string;
  status?: string;
  state?: string;
  district?: string;
  preferredLanguage?: string;
  passwordHash?: string; // used locally for mock auth
  createdAt: string;
  lastLogin?: string;
  phone?: string;
}

export interface Submission {
  id: string;
  citizenId: string;
  citizenName: string;
  title: string;
  description: string;
  category: 'Roads & Transport' | 'Water Supply' | 'Electricity & Power' | 'Sanitation & Waste' | 'Healthcare' | 'Education' | 'Public Spaces' | 'Other';
  type: 'complaint' | 'suggestion';
  source?: 'portal' | 'whatsapp' | 'sms' | 'voice';
  department?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  timeline?: Array<{ status: string; description: string; updatedAt: string; updatedBy?: string }>;
  citizenFeedback?: { rating: number; comment?: string; createdAt: string };
  mediaUrl?: string; // Image showing issue
  audioUrl?: string; // Audio file showing issue
  location: {
    lat: number;
    lng: number;
    address?: string;
    village?: string;
    ward?: string;
    district: string;
    state: string;
  };
  status: 'pending' | 'in_progress' | 'resolved';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  priorityScore: number;
  confidenceScore: number;
  aiAnalysis: {
    detectedLanguage: string;
    englishTranslation: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgencyReasoning: string;
    ocrResult?: string;
    audioTranscript?: string;
    suggestedSchemes: string[];
    isDuplicate: boolean;
    duplicateGroupId?: string;
    evidence: string[];
    uncertaintyLevel: 'low' | 'medium' | 'high';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  constituency: string;
  linkedSubmissions: string[]; // List of submission IDs that prompted this
  priorityScore: number; // Calculated based on citizen demand, urgency, and impact
  confidenceScore: number;
  populationImpact: number;
  infrastructureGapIndex: number; // 0 to 10
  estimatedBudget: number; // In Rupees
  estimatedTimeline: string; // e.g. "3-6 months"
  governmentSchemes: string[];
  riskAnalysis: string;
  benefits: string;
  expectedComplaintReduction: number; // percentage (e.g. 85%)
  sdgMapping: string[]; // List of matching SDGs (e.g. ["SDG 6", "SDG 9"])
  reasoning: string;
  retrievedDocuments: string[]; // Citations
  status: 'proposed' | 'approved' | 'rejected' | 'implemented';
  responsibleDepartment?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  environmentalImpact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateGroup {
  id: string;
  primarySubmissionId: string;
  submissionIds: string[];
  category: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface PublicDataset {
  id: string;
  constituency: string;
  population: number;
  roadDensity: number; // km per sq km
  waterAvailability: number; // percentage of households
  electricityAvailability: number; // percentage of households
  schoolsCount: number;
  hospitalsCount: number;
  gaps: {
    waterSupply: string[];
    healthcare: string[];
    schools: string[];
    roads: string[];
  };
  hospitalLocations: { lat: number; lng: number; name: string }[];
  schoolLocations: { lat: number; lng: number; name: string }[];
  roadLocations: { lat: number; lng: number; name: string }[];
  waterLocations: { lat: number; lng: number; name: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'critical' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  constituency: string;
  month: string; // YYYY-MM
  complaintVolume: number;
  categoriesTrend: { category: string; count: number }[];
  hotspotsForecast: { lat: number; lng: number; weight: number; reasoning: string }[];
  expectedImpactScores: { category: string; reduction: number }[];
  createdAt: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  vector?: number[]; // Embedding representation
}
