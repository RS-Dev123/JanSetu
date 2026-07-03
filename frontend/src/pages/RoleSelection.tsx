import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Shield, Briefcase, Award, ArrowRight } from 'lucide-react';

export const RoleSelection: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'mp' | 'officer' | 'admin') => {
    login(role);
    if (role === 'mp') {
      navigate('/mp');
    } else if (role === 'officer') {
      navigate('/officer');
    } else {
      navigate('/admin');
    }
  };

  const roles = [
    {
      id: 'mp',
      title: 'Member of Parliament (MP)',
      desc: 'Formulate regional plans, allocate budget funds, simulate scenario impacts, and review constituency development indicators.',
      icon: <Award className="w-8 h-8 text-brand-400" />,
      glowColor: 'group-hover:shadow-brand-500/10'
    },
    {
      id: 'officer',
      title: 'District Officer',
      desc: 'Verify submitted grievances, assign tasks to departments, log physical inspections, and update repair statuses.',
      icon: <Briefcase className="w-8 h-8 text-cyan-400" />,
      glowColor: 'group-hover:shadow-cyan-500/10'
    },
    {
      id: 'admin',
      title: 'System Administrator',
      desc: 'Manage all database mock states, run automated seeds, inspect system logs, and modify overall application properties.',
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      glowColor: 'group-hover:shadow-emerald-500/10'
    }
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 px-6 py-12 relative overflow-hidden font-sans text-slate-100">
      {/* Background Decorative Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl top-10 left-10"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl -bottom-10 -right-10"></div>

      <div className="w-full max-w-4xl text-center mb-10 z-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
          Select Simulation Role
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Choose a government representative persona to explore their dedicated tools, workflows, and administrative dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => handleRoleSelect(r.id as any)}
            className="group text-left focus:outline-none transition-transform hover:scale-[1.02] duration-200"
          >
            <GlassCard className="border border-white/10 hover:border-white/20 h-full p-6 flex flex-col justify-between relative shadow-xl">
              <div className="space-y-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
                  {r.icon}
                </div>
                <h2 className="text-lg font-bold text-slate-200 group-hover:text-brand-400 transition-colors">
                  {r.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {r.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-brand-400 group-hover:text-brand-300">
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </GlassCard>
          </button>
        ))}
      </div>

      {/* Back button */}
      <div className="text-center mt-10 z-10">
        <button
          onClick={() => navigate('/government/login')}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back to Government Login
        </button>
      </div>
    </div>
  );
};
