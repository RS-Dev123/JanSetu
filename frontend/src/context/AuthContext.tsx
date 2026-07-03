import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'citizen' | 'mp' | 'officer' | 'admin';
  constituency: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: 'citizen' | 'mp' | 'officer' | 'admin') => void;
  logout: () => void;
  register?: (
    email: string,
    password: string,
    name: string,
    role: User["role"],
    constituency: string
  ) => Promise<void>;
  loginWithGoogle?: (rememberMe?: boolean) => Promise<void>;
  loginWithPhone?: (phoneNumber: string, appVerifier: any) => Promise<void>;
  verifyPhoneOTP?: (verificationId: string, code: string) => Promise<void>;
  loginAnonymously?: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  refreshProfile?: () => Promise<void>;
  completeProfile?: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = sessionStorage.getItem('demo_user_role') as User['role'] | null;
    if (role) {
      setUser({
        uid: `usr_${role}_demo`,
        name: role === 'citizen' ? 'Demo Citizen' :
              role === 'officer' ? 'Dr. Suresh Bose (Officer)' :
              role === 'mp' ? 'Mohan Reddy (MP)' : 'Admin Demo',
        email: `${role}.demo@jansetu.in`,
        role,
        constituency: role === 'citizen' ? 'New Delhi' :
                      role === 'officer' ? 'Paschim Medinipur' :
                      role === 'mp' ? 'Bengaluru Urban' : 'New Delhi'
      });
      localStorage.setItem('token', role); // set role as mock token for backend headers
    } else {
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  const login = (role: 'citizen' | 'mp' | 'officer' | 'admin') => {
    sessionStorage.setItem('demo_user_role', role);
    localStorage.setItem('token', role);
    setUser({
      uid: `usr_${role}_demo`,
      name: role === 'citizen' ? 'Demo Citizen' :
            role === 'officer' ? 'Dr. Suresh Bose (Officer)' :
            role === 'mp' ? 'Mohan Reddy (MP)' : 'Admin Demo',
      email: `${role}.demo@jansetu.in`,
      role,
      constituency: role === 'citizen' ? 'New Delhi' :
                    role === 'officer' ? 'Paschim Medinipur' :
                    role === 'mp' ? 'Bengaluru Urban' : 'New Delhi'
    });
  };

  const logout = () => {
    sessionStorage.removeItem('demo_user_role');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Add dummy definitions for legacy compatibility to ensure zero compilation breaks
  const dummyAsync = async () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register: async () => {},
      loginWithGoogle: dummyAsync,
      loginWithPhone: dummyAsync,
      verifyPhoneOTP: dummyAsync,
      loginAnonymously: dummyAsync,
      resetPassword: dummyAsync,
      refreshProfile: dummyAsync,
      completeProfile: dummyAsync
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
