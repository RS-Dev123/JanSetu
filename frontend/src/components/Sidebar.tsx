import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  BarChart3, 
  Map, 
  Lightbulb, 
  Cpu, 
  MessageSquare, 
  Download, 
  Settings, 
  LogOut,
  Layers,
  TrendingUp,
  DollarSign,
  Sparkles,
  Star
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const citizenLinks = [
    { to: '/citizen', label: 'Submit Issue', icon: PlusCircle },
    { to: '/judge', label: 'Executive Simulation', icon: Star }
  ];

  const officerLinks = [
    { to: '/citizen', label: 'Submit Issue', icon: PlusCircle },
    { to: '/officer', label: 'Officer Panel', icon: Settings },
    { to: '/map', label: 'Hotspot Map', icon: Map },
    { to: '/predictions', label: 'Predictive Risks', icon: TrendingUp },
    { to: '/copilot', label: 'JanSetu AI Assistant', icon: MessageSquare },
    { to: '/reports', label: 'Reports', icon: Download },
    { to: '/judge', label: 'Executive Simulation', icon: Star }
  ];

  const mpLinks = [
    { to: '/citizen', label: 'Submit Issue', icon: PlusCircle },
    { to: '/mp', label: 'Analytics', icon: BarChart3 },
    { to: '/map', label: 'Hotspot Map', icon: Map },
    { to: '/recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { to: '/planner', label: 'AI Project Planner', icon: Layers },
    { to: '/budget-optimizer', label: 'Budget Optimizer', icon: DollarSign },
    { to: '/predictions', label: 'Predictive Risks', icon: TrendingUp },
    { to: '/simulator', label: 'What-If Simulator', icon: Sparkles },
    { to: '/copilot', label: 'JanSetu AI Assistant', icon: MessageSquare },
    { to: '/workflow', label: 'AI Workflow', icon: Cpu },
    { to: '/reports', label: 'Reports', icon: Download },
    { to: '/judge', label: 'Executive Simulation', icon: Star }
  ];

  const adminLinks = [
    { to: '/citizen', label: 'Submit Issue', icon: PlusCircle },
    { to: '/mp', label: 'Analytics', icon: BarChart3 },
    { to: '/map', label: 'Hotspot Map', icon: Map },
    { to: '/recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { to: '/planner', label: 'AI Project Planner', icon: Layers },
    { to: '/budget-optimizer', label: 'Budget Optimizer', icon: DollarSign },
    { to: '/predictions', label: 'Predictive Risks', icon: TrendingUp },
    { to: '/simulator', label: 'What-If Simulator', icon: Sparkles },
    { to: '/copilot', label: 'JanSetu AI Assistant', icon: MessageSquare },
    { to: '/workflow', label: 'AI Workflow', icon: Cpu },
    { to: '/reports', label: 'Reports', icon: Download },
    { to: '/admin', label: 'Admin Panel', icon: Settings },
    { to: '/judge', label: 'Executive Simulation', icon: Star }
  ];

  const links = 
    user.role === 'citizen' ? citizenLinks : 
    user.role === 'officer' ? officerLinks : 
    user.role === 'mp' ? mpLinks :
    adminLinks;

  return (
    <aside className="w-64 glass-panel h-screen sticky top-0 flex flex-col border-r border-darkborder z-20 overflow-hidden">
      <div className="saffron-accent-line w-full h-[2.5px] shrink-0" />
      {/* Brand Header */}
      <div className="p-6 border-b border-darkborder flex items-center gap-3">
        <div className="p-2.5 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-500/20">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
            JanSetu
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            People's Priorities
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-darkborder">
        <div className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-xl border border-white/5 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate text-slate-200">{user?.name ?? "User"}</h4>
            <span className="text-[10px] uppercase font-bold text-brand-400 px-2 py-0.5 bg-brand-500/10 rounded-full border border-brand-500/25">
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
