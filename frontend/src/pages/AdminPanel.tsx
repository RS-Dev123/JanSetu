import React, { useState, useEffect } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Settings, Activity, Bell, Database, RefreshCw, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { submissions, recommendations, notifications, isDemoMode, toggleDemoMode, refreshData, simulateNewSubmission } = useDB();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'notifications'>('overview');
  const [simulating, setSimulating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await simulateNewSubmission();
      await refreshData();
    } finally {
      setTimeout(() => setSimulating(false), 1500);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 800);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'submissions', label: 'Submissions', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  const systemStats = [
    { label: 'Total Submissions', value: submissions.length, color: '#2a99ff' },
    { label: 'Recommendations', value: recommendations.length, color: '#f59e0b' },
    { label: 'Pending Review', value: submissions.filter(s => s.status === 'pending').length, color: '#f97316' },
    { label: 'Resolved', value: submissions.filter(s => s.status === 'resolved').length, color: '#10b981' },
    { label: 'Critical Issues', value: submissions.filter(s => s.urgency === 'critical').length, color: '#ef4444' },
    { label: 'Approved Projects', value: recommendations.filter(r => r.status === 'approved').length, color: '#8b5cf6' },
    { label: 'Unread Alerts', value: notifications.filter(n => !n.isRead).length, color: '#06b6d4' },
    { label: 'Demo Mode', value: isDemoMode ? 'ON' : 'OFF', color: isDemoMode ? '#10b981' : '#6b7280' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <Settings className="w-7 h-7 text-brand-500" />
            Admin Control Panel
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            System management, configuration, and real-time oversight. Logged in as <b className="text-brand-400">{user?.name}</b> ({user?.role})
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 glass-panel border border-white/5 text-slate-400 hover:text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all disabled:opacity-60"
          >
            <Zap className={`w-4 h-4 ${simulating ? 'animate-pulse' : ''}`} />
            {simulating ? 'Simulating...' : 'Simulate Complaint'}
          </button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      <GlassCard className={`border flex items-center justify-between gap-6 py-4 ${isDemoMode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDemoMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800/60 text-slate-500'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-sm font-bold ${isDemoMode ? 'text-emerald-400' : 'text-slate-400'}`}>
              Simulation Center {isDemoMode ? '— Active' : '— Inactive'}
            </p>
            <p className="text-xs text-slate-500">
              {isDemoMode
                ? 'System is using preloaded simulation data for testing and evaluation.'
                : 'Toggle Simulation Center to load sample citizen complaints, census data and hotspot analysis instantly.'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleDemoMode}
          className={`relative w-14 h-7 rounded-full border transition-all shrink-0 ${isDemoMode ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${isDemoMode ? 'left-8' : 'left-1'}`} />
        </button>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 glass-panel border border-white/5 rounded-xl p-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemStats.map(stat => (
              <GlassCard key={stat.label} className="border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Category breakdown */}
          <GlassCard className="border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-500" /> Submissions by Category
            </h3>
            {['Roads & Transport', 'Water Supply', 'Electricity & Power', 'Sanitation & Waste', 'Healthcare', 'Education', 'Public Spaces', 'Other'].map(cat => {
              const count = submissions.filter(s => s.category === cat).length;
              const pct = submissions.length ? Math.round((count / submissions.length) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{cat}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-brand-600 to-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <GlassCard className="border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-500" /> All Submissions ({submissions.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Citizen', 'Title', 'Category', 'Urgency', 'Status', 'Score', 'District'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.slice(0, 20).map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 px-3 text-slate-300 font-medium">{s.citizenName}</td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-40 truncate">{s.title}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.category.split(' ')[0]}</td>
                    <td className="py-2.5 px-3">
                      <span className={`capitalize font-bold ${
                        s.urgency === 'critical' ? 'text-red-400' :
                        s.urgency === 'high' ? 'text-orange-400' :
                        s.urgency === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{s.urgency}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        s.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        s.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>{s.status}</span>
                    </td>
                    <td className="py-2.5 px-3 font-black text-brand-400">{s.priorityScore}</td>
                    <td className="py-2.5 px-3 text-slate-500">{s.location?.district}</td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-600">No submissions. Enable Demo Mode or submit a grievance.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <GlassCard className="border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" /> System Notifications ({notifications.length})
          </h3>
          <div className="space-y-2">
            {notifications.slice(0, 20).map(n => (
              <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                !n.isRead ? 'border-brand-500/20 bg-brand-500/3' : 'border-white/5 bg-transparent'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                  n.type === 'critical' ? 'bg-red-500/15 text-red-400' :
                  'bg-brand-500/15 text-brand-400'
                }`}>
                  {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   n.type === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
                   <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0 mt-2"></div>}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-10 text-slate-600">No notifications yet.</div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
