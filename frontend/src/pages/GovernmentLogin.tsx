import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Layers, ArrowRight, ShieldAlert } from 'lucide-react';

export const GovernmentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/government/select-role');
    }, 600); // short delay for visual response
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans text-slate-100">
      {/* Decorative Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl top-10 left-10"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl -bottom-10 -right-10"></div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/20 mb-4 animate-pulse">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
            JanSetu
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">
            Government representative portal
          </p>
        </div>

        <GlassCard className="border border-white/10 shadow-2xl p-8 relative">
          <div className="saffron-accent-line absolute top-0 left-0 w-full h-[3px] rounded-t-2xl" />
          
          <div className="mb-6 space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Welcome, Officer/Representative</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log in to access administrative tools, assign/resolve grievances, simulate scenario metrics, and monitor constituency budgets.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Authorized Representative Session</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Select your assigned role on the next screen to begin simulating.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/15"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Representative</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </GlassCard>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
