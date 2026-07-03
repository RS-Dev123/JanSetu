export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Auth Methods
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    register: async (email: string, password: string, name: string, role: string, constituency: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password, name, role, constituency })
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    googleLogin: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    googleRegister: async (payload: {
      role: string;
      constituency: string;
      state: string;
      district: string;
      phone?: string;
      preferredLanguage?: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/auth/google-register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    },
    logout: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    forgotPassword: async (email: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });
      return handleResponse(res);
    },
    resetPassword: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    updateProfile: async (payload: {
      name?: string;
      displayName?: string;
      photoURL?: string;
      role?: string;
      constituency?: string;
      phone?: string;
      state?: string;
      district?: string;
      preferredLanguage?: string;
      status?: string;
      email?: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse(res);
    }
  },

  // Submissions Methods
  submissions: {
    getAll: async (filters?: { category?: string; status?: string; urgency?: string; constituency?: string; polygon?: string }) => {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val) queryParams.append(key, val);
        });
      }
      const res = await fetch(`${API_BASE_URL}/submissions?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/submissions/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, status: 'pending' | 'in_progress' | 'resolved') => {
      const res = await fetch(`${API_BASE_URL}/submissions/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  // Recommendations Methods
  recommendations: {
    getAll: async (constituency?: string) => {
      const url = constituency ? `${API_BASE_URL}/recommendations?constituency=${constituency}` : `${API_BASE_URL}/recommendations`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    generate: async () => {
      const res = await fetch(`${API_BASE_URL}/recommendations/generate`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    approve: async (id: string, status: 'approved' | 'rejected') => {
      const res = await fetch(`${API_BASE_URL}/recommendations/${id}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  chat: {
    send: async (message: string, history?: any[]) => {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, history })
      });
      return handleResponse(res);
    },
    getHistory: async () => {
      const res = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Notifications Methods
  notifications: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    markRead: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Export URLs
  reports: {
    getCSVUrl: () => `${API_BASE_URL}/reports/csv?token=${localStorage.getItem('token')}`,
    getPDFUrl: () => `${API_BASE_URL}/reports/pdf?token=${localStorage.getItem('token')}`
  },

  // AI Upgrade Methods
  ai: {
    getPriorityReport: async (submissionId: string) => {
      const res = await fetch(`${API_BASE_URL}/ai/priority-report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ submissionId })
      });
      return handleResponse(res);
    },
    optimizeBudget: async (totalBudget: number, constituency?: string, categories?: string[]) => {
      const res = await fetch(`${API_BASE_URL}/ai/budget-optimize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ totalBudget, constituency, categories })
      });
      return handleResponse(res);
    },
    planDevelopment: async (params: {
      budget: number;
      timelineMonths?: number;
      departments?: string[];
      district: string;
      village?: string;
      ward?: string;
      population?: number;
    }) => {
      const res = await fetch(`${API_BASE_URL}/ai/planner`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params)
      });
      return handleResponse(res);
    },
    getPredictions: async (constituency: string, targetMonth: string) => {
      const res = await fetch(`${API_BASE_URL}/ai/predict?constituency=${encodeURIComponent(constituency)}&targetMonth=${encodeURIComponent(targetMonth)}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    simulateScenario: async (inputs: {
      schools: number;
      roads: number;
      bridges: number;
      solarPlants: number;
      waterTanks: number;
    }) => {
      const res = await fetch(`${API_BASE_URL}/ai/simulate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(inputs)
      });
      return handleResponse(res);
    },
    generateMeetingBrief: async (constituency: string, type: 'daily' | 'weekly' | 'monthly') => {
      const res = await fetch(`${API_BASE_URL}/ai/meeting-brief`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ constituency, type })
      });
      return handleResponse(res);
    },
    updateLifecycleStage: async (submissionId: string, newStage: string, remarks?: string) => {
      const res = await fetch(`${API_BASE_URL}/ai/lifecycle-stage`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ submissionId, newStage, remarks })
      });
      return handleResponse(res);
    },
    getDuplicateClusters: async () => {
      const res = await fetch(`${API_BASE_URL}/ai/duplicate-clusters`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getGovData: async (filters: { district?: string; lat?: number; lng?: number; station?: string }) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined) queryParams.append(key, String(val));
      });
      const res = await fetch(`${API_BASE_URL}/ai/gov-data?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
