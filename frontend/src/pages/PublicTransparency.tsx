import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { API_BASE_URL } from '../services/api';
import { 
  Layers, ArrowLeft, BarChart3, Megaphone, CheckSquare 
} from 'lucide-react';

export const PublicTransparency: React.FC = () => {
  const navigate = useNavigate();
  const [constituency, setConstituency] = useState('New Delhi');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Local fetch fallback for previewing statistics
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const resSubs = await fetch(`${API_BASE_URL}/submissions`);
        const resRecs = await fetch(`${API_BASE_URL}/recommendations`);
        if (resSubs.ok && resRecs.ok) {
          setSubmissions(await resSubs.json());
          setRecommendations(await resRecs.json());
        }
      } catch (e) {
        console.warn('Backend not running, loading local mock data.', e);
        // Local state mock
        setSubmissions([
          { id: '1', title: 'Water Leak Main Road', category: 'Water Supply', status: 'resolved', location: { district: 'New Delhi' }, priorityScore: 78, createdAt: new Date().toISOString() },
          { id: '2', title: 'Streetlights out', category: 'Electricity & Power', status: 'in_progress', location: { district: 'New Delhi' }, priorityScore: 56, createdAt: new Date().toISOString() },
          { id: '3', title: 'Pothole patch repair', category: 'Roads & Transport', status: 'pending', location: { district: 'New Delhi' }, priorityScore: 68, createdAt: new Date().toISOString() }
        ]);
        setRecommendations([
          { id: 'rec_1', title: 'Ward 14 Overhead Water Tank', category: 'Water Supply', estimatedBudget: 1800000, estimatedTimeline: '3 months', status: 'approved', constituency: 'New Delhi' },
          { id: 'rec_2', title: 'Vasant Kunj Road Resurfacing', category: 'Roads & Transport', estimatedBudget: 3200000, estimatedTimeline: '5 months', status: 'implemented', constituency: 'New Delhi' }
        ]);
      }
    };
    fetchPublicData();
  }, []);

  const filteredSubs = submissions.filter(s => s.location?.district === constituency);
  const filteredRecs = recommendations.filter(r => r.constituency === constituency);

  const stats = {
    totalComplaints: filteredSubs.length,
    resolvedCount: filteredSubs.filter(s => s.status === 'resolved').length,
    activeProjects: filteredRecs.filter(r => r.status === 'approved' || r.status === 'proposed').length,
    completedProjects: filteredRecs.filter(r => r.status === 'implemented' || r.status === 'completed').length,
  };

  const constituencyProfiles: Record<string, any> = {
    'New Delhi': { population: '4,50,000', roadDensity: '2.1 km/sq km', water: '72%', electricity: '89%' },
    'Bengaluru Urban': { population: '6,50,000', roadDensity: '3.5 km/sq km', water: '81%', electricity: '94%' },
    'Paschim Medinipur': { population: '2,80,000', roadDensity: '0.9 km/sq km', water: '55%', electricity: '76%' },
  };

  const profile = constituencyProfiles[constituency] || constituencyProfiles['New Delhi'];

  const announcements = [
    { title: 'Jal Jeevan Pipeline Laying Ward 7', date: 'July 1, 2026', body: 'Excavation work for pipeline upgrade under Jal Jeevan Mission will commence Friday. Water supply diverted.' },
    { title: 'PMGSY Road Blacktopping Complete', date: 'June 28, 2026', body: 'The 3.2km agricultural feeder link road connecting local market has been completed ahead of schedule.' },
    { title: 'Public Feedback Window Open', date: 'June 25, 2026', body: 'AI-generated budget proposals are open for citizen comments inside the Citizen Portal. Log in to rate proposed works.' }
  ];

  return (
    <div className="min-h-screen bg-darkbg text-slate-100 overflow-y-auto flex flex-col">
      {/* Header Bar */}
      <nav className="glass-panel sticky top-0 z-50 border-b border-white/5 py-4 px-8 flex justify-between items-center shrink-0">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Landing
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-600 rounded-lg text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
            JanSetu Transparency Dashboard
          </span>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
              Constituency Transparency Portal
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Public tracking of ongoing development projects, grievance resolutions, and local statistics.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Region</label>
            <select
              value={constituency}
              onChange={e => setConstituency(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="New Delhi">New Delhi</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
              <option value="Paschim Medinipur">Paschim Medinipur</option>
            </select>
          </div>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Grievances</p>
            <p className="text-3xl font-black text-brand-400 mt-1">{stats.totalComplaints}</p>
          </GlassCard>
          <GlassCard className="border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolved Requests</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats.resolvedCount}</p>
          </GlassCard>
          <GlassCard className="border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Projects</p>
            <p className="text-3xl font-black text-amber-500 mt-1">{stats.activeProjects}</p>
          </GlassCard>
          <GlassCard className="border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed Works</p>
            <p className="text-3xl font-black text-cyan-400 mt-1">{stats.completedProjects}</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ongoing Development Projects */}
          <div className="lg:col-span-8 space-y-6">
            <GlassCard className="border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <CheckSquare className="w-5 h-5 text-brand-500" />
                Active Development Projects
              </h3>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {filteredRecs.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 text-sm">
                    No active development projects proposed for this constituency.
                  </div>
                ) : (
                  filteredRecs.map(rec => (
                    <div key={rec.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">{rec.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{rec.category}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          rec.status === 'implemented' || rec.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs pt-1.5 border-t border-slate-800/40">
                        <div>
                          <span className="text-slate-500">Project Budget</span>
                          <p className="font-bold text-slate-300">
                            {rec.estimatedBudget ? `₹${(rec.estimatedBudget / 100000).toFixed(1)} Lakhs` : '₹12.5 Lakhs'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeline Estimate</span>
                          <p className="font-bold text-slate-300">{rec.estimatedTimeline || '3-4 Months'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Side Info Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Local Stats */}
            <GlassCard className="border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <BarChart3 className="w-5 h-5 text-brand-500" />
                Constituency Profile
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Population</span>
                  <span className="text-slate-300 font-bold">{profile.population}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Road Density</span>
                  <span className="text-slate-300 font-bold">{profile.roadDensity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Water Network Coverage</span>
                  <span className="text-slate-300 font-bold">{profile.water}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Electricity Coverage</span>
                  <span className="text-slate-300 font-bold">{profile.electricity}</span>
                </div>
              </div>
            </GlassCard>

            {/* Public Announcements */}
            <GlassCard className="border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <Megaphone className="w-5 h-5 text-brand-500" />
                Latest Updates
              </h3>
              <div className="space-y-4">
                {announcements.map((a, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className="font-bold text-brand-400">Notice</span>
                      <span>{a.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-300">{a.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{a.body}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600 bg-slate-950/40 shrink-0">
        <p>© 2026 JanSetu Transparency Board. Open Governance Portal.</p>
      </footer>
    </div>
  );
};
