import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { useAuth } from './AuthContext';

// Define structures matching database types
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
  mediaUrl?: string;
  audioUrl?: string;
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
  linkedSubmissions: string[];
  priorityScore: number;
  confidenceScore: number;
  populationImpact: number;
  infrastructureGapIndex: number;
  estimatedBudget: number;
  estimatedTimeline: string;
  governmentSchemes: string[];
  riskAnalysis: string;
  benefits: string;
  expectedComplaintReduction: number;
  sdgMapping: string[];
  reasoning: string;
  retrievedDocuments: string[];
  status: 'proposed' | 'approved' | 'rejected' | 'implemented';
  responsibleDepartment?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  environmentalImpact?: string;
  createdAt: string;
  updatedAt: string;
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

interface DBContextType {
  submissions: Submission[];
  recommendations: Recommendation[];
  notifications: Notification[];
  loadingSubmissions: boolean;
  loadingRecommendations: boolean;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  refreshData: () => Promise<void>;
  createSubmission: (formData: FormData) => Promise<Submission>;
  updateStatus: (id: string, status: 'pending' | 'in_progress' | 'resolved') => Promise<void>;
  approveRec: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  generateRecs: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  simulateNewSubmission: () => Promise<void>;
}

const DBContext = createContext<DBContextType | undefined>(undefined);

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('demo_mode') === 'true';
  });

  const toggleDemoMode = () => {
    const val = !isDemoMode;
    setIsDemoMode(val);
    localStorage.setItem('demo_mode', String(val));
  };

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingSubmissions(true);
    setLoadingRecommendations(true);
    try {
      const subs = await api.submissions.getAll();
      setSubmissions(subs);
      
      const recs = await api.recommendations.getAll();
      setRecommendations(recs);

      const notifs = await api.notifications.getAll();
      setNotifications(notifs);
    } catch (err) {
      console.warn('Backend connection failed, loading simulated mock data.', err);
      // Mock Datasets fallbacks handled inside component display or loaded from seed files.
    } finally {
      setLoadingSubmissions(false);
      setLoadingRecommendations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData, isDemoMode]);

  const createSubmission = async (formData: FormData): Promise<Submission> => {
    const newSub = await api.submissions.create(formData);
    setSubmissions(prev => [newSub, ...prev]);
    return newSub;
  };

  const updateStatus = async (id: string, status: 'pending' | 'in_progress' | 'resolved') => {
    await api.submissions.updateStatus(id, status);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s));
  };

  const approveRec = async (id: string, status: 'approved' | 'rejected') => {
    await api.recommendations.approve(id, status);
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
  };

  const generateRecs = async () => {
    setLoadingRecommendations(true);
    try {
      await api.recommendations.generate();
      const recs = await api.recommendations.getAll();
      setRecommendations(recs);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const simulateNewSubmission = async () => {
    try {
      // Endpoint trigger for backend simulation seeder
      const res = await fetch(`${API_BASE_URL}/submissions/simulate-complaint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error('Simulate complaint failed:', e);
    }
  };

  return (
    <DBContext.Provider value={{
      submissions,
      recommendations,
      notifications,
      loadingSubmissions,
      loadingRecommendations,
      isDemoMode,
      toggleDemoMode,
      refreshData,
      createSubmission,
      updateStatus,
      approveRec,
      generateRecs,
      markNotificationRead,
      simulateNewSubmission
    }}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error('useDB must be used within a DBProvider');
  }
  return context;
};
