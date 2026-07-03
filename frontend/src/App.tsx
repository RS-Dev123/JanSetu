import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DBProvider } from './context/DBContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { PublicTransparency } from './pages/PublicTransparency';
import { CitizenPortal } from './pages/CitizenPortal';
import { OfficerPortal } from './pages/OfficerPortal';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { MapDashboard } from './pages/MapDashboard';
import { Recommendations } from './pages/Recommendations';
import { AICopilot } from './pages/AICopilot';
import { AIWorkflow } from './pages/AIWorkflow';
import { Reports } from './pages/Reports';
import { AdminPanel } from './pages/AdminPanel';
import { DevelopmentPlannerPage } from './pages/DevelopmentPlannerPage';
import { BudgetOptimizerPage } from './pages/BudgetOptimizerPage';
import { PredictiveDashboard } from './pages/PredictiveDashboard';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { JudgeDashboard } from './pages/JudgeDashboard';
import { CitizenLogin } from './pages/CitizenLogin';
import { GovernmentLogin } from './pages/GovernmentLogin';
import { RoleSelection } from './pages/RoleSelection';

// Simple Protected Route Guard for Hackathon
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-darkbg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Application Shell Layer (Binds Sidebar + Main Content)
const AppLayout: React.FC = () => {
  return (
    <div className="flex bg-darkbg min-h-screen w-screen text-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Routes>
          <Route path="/citizen" element={<CitizenPortal />} />
          <Route path="/officer" element={<OfficerPortal />} />
          <Route path="/mp" element={<AnalyticsDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/map" element={<MapDashboard />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/copilot" element={<AICopilot />} />
          <Route path="/workflow" element={<AIWorkflow />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/planner" element={<DevelopmentPlannerPage />} />
          <Route path="/budget-optimizer" element={<BudgetOptimizerPage />} />
          <Route path="/predictions" element={<PredictiveDashboard />} />
          <Route path="/simulator" element={<ScenarioSimulatorPage />} />
          <Route path="/judge" element={<JudgeDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DBProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/transparency" element={<PublicTransparency />} />
            <Route path="/citizen/login" element={<CitizenLogin />} />
            <Route path="/government/login" element={<GovernmentLogin />} />
            <Route path="/government/select-role" element={<RoleSelection />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </DBProvider>
    </AuthProvider>
  );
};

export default App;
