import React, { useState, useEffect } from 'react';
import { useDB, Submission } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { 
  Shield, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  Database, UserCheck, Inbox
} from 'lucide-react';

const DEPARTMENTS = [
  'Public Works Department (PWD)',
  'Ministry of Water Resources & Jal Jeevan',
  'State Electricity Board',
  'Municipal Sanitation & Solid Waste Dept',
  'National Health Authority (NHA)',
  'Department of School Education'
];

export const OfficerPortal: React.FC = () => {
  const { user } = useAuth();
  const { submissions, refreshData } = useDB();
  const [activeTab, setActiveTab] = useState<'queue' | 'assigned' | 'dashboard'>('queue');

  // Form states for verification
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [officerComment, setOfficerComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshData(); }, [refreshData]);

  // Handle verify and assign department
  const handleVerifyGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setLoading(true);

    try {
      // Simulate backend API updates for assignment & timeline
      const updatedTimeline = [
        ...(selectedSub.timeline || []),
        {
          status: 'Department Assigned',
          description: `Grievance verified by Officer ${user?.name}. Assigned to ${selectedDept}. Note: ${officerComment || 'None'}`,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name
        }
      ];

      // Call API updates
      await fetch(`${API_BASE_URL}/submissions/${selectedSub.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'in_progress',
          department: selectedDept,
          assignedOfficerId: user?.uid,
          assignedOfficerName: user?.name,
          timeline: updatedTimeline
        })
      });

      await refreshData();
      setSelectedSub(null);
      setOfficerComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Mark resolved
  const handleResolveGrievance = async (sub: Submission) => {
    try {
      const updatedTimeline = [
        ...(sub.timeline || []),
        {
          status: 'Completed',
          description: `Grievance resolved. Infrastructure repair works completed and verified by PWD/Jal Jeevan inspection officers.`,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name
        }
      ];

      await fetch(`${API_BASE_URL}/submissions/${sub.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'resolved',
          timeline: updatedTimeline
        })
      });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter queues
  const pendingQueue = submissions.filter(s => s.status === 'pending');
  const assignedQueue = submissions.filter(s => s.status === 'in_progress' && s.assignedOfficerId === user?.uid);
  const resolvedCount = submissions.filter(s => s.status === 'resolved' && s.assignedOfficerId === user?.uid).length;

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <Shield className="w-7 h-7 text-brand-500" />
            District Officer Portal
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Verify citizen submissions, assign departments, and track execution. Department: <b className="text-brand-400">{selectedDept}</b>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-panel border border-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'queue' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Verification Queue ({pendingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'assigned' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          My Assigned Issues ({assignedQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Department Dashboard
        </button>
      </div>

      {/* Queue View */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`${selectedSub ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            <GlassCard className="border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-slate-300">Awaiting Verification & Department Assignment</h3>
              <div className="space-y-3">
                {pendingQueue.map(sub => (
                  <div 
                    key={sub.id} 
                    onClick={() => setSelectedSub(sub)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                      selectedSub?.id === sub.id ? 'border-brand-500 bg-brand-500/5' : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{sub.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sub.description}</p>
                      <div className="flex gap-4 text-[10px] text-slate-500 mt-2">
                        <span>Category: <b>{sub.category}</b></span>
                        <span>Urgency: <b className="text-red-400 capitalize">{sub.urgency}</b></span>
                        <span>Priority Score: <b className="text-brand-400">{sub.priorityScore}</b></span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 self-center" />
                  </div>
                ))}
                {pendingQueue.length === 0 && (
                  <div className="text-center py-10 text-slate-600 text-sm">No pending citizen grievances in the queue.</div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Verification Pane */}
          {selectedSub && (
            <div className="lg:col-span-5">
              <GlassCard className="border border-brand-500/20 bg-brand-500/3 space-y-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-200">Verify Grievance</h3>
                  <button onClick={() => setSelectedSub(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Title</h4>
                  <p className="text-sm text-slate-200 font-semibold">{selectedSub.title}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">AI Orchestrator Analysis</h4>
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 space-y-2 mt-1">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <b>Summary:</b> {selectedSub.aiAnalysis?.summary || selectedSub.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800">
                      {selectedSub.aiAnalysis?.suggestedSchemes?.map((sch, i) => (
                        <span key={i} className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                          {sch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifyGrievance} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Department</label>
                    <select
                      value={selectedDept}
                      onChange={e => setSelectedDept(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-brand-500 outline-none"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Officer Verification Comment</label>
                    <textarea
                      rows={3}
                      value={officerComment}
                      onChange={e => setOfficerComment(e.target.value)}
                      placeholder="e.g. Verified by visual scene scan. Fits PMGSY criteria."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-brand-500 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Verify and Route to Dept'}
                  </button>
                </form>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {/* Assigned Issues Tab */}
      {activeTab === 'assigned' && (
        <GlassCard className="border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">My Assigned Issues ({assignedQueue.length})</h3>
          <div className="space-y-3">
            {assignedQueue.map(sub => (
              <div key={sub.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{sub.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{sub.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">District: {sub.location?.district} • Status: <b className="text-amber-400 capitalize">{sub.status}</b></p>
                </div>
                <button
                  onClick={() => handleResolveGrievance(sub)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              </div>
            ))}
            {assignedQueue.length === 0 && (
              <div className="text-center py-10 text-slate-600 text-sm">No issues assigned to you for execution.</div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Department Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="border border-white/5 flex flex-col items-center justify-center py-8">
            <Clock className="w-8 h-8 text-brand-400 mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Cases</p>
            <p className="text-3xl font-black text-slate-200 mt-1">{assignedQueue.length}</p>
          </GlassCard>
          <GlassCard className="border border-white/5 flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resolved Cases</p>
            <p className="text-3xl font-black text-slate-200 mt-1">{resolvedCount}</p>
          </GlassCard>
          <GlassCard className="border border-white/5 flex flex-col items-center justify-center py-8">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Escalations Pending</p>
            <p className="text-3xl font-black text-slate-200 mt-1">0</p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
