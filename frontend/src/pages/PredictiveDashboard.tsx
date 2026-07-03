import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { Calendar, Cpu, TrendingUp, AlertTriangle, AlertCircle, ShieldAlert, BarChart } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const PredictiveDashboard: React.FC = () => {
  const [constituency, setConstituency] = useState('New Delhi');
  const [targetMonth, setTargetMonth] = useState('2026-07');
  const [loading, setLoading] = useState(false);
  const [predResult, setPredResult] = useState<any>(null);

  const monthsList = [
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-06', label: 'June 2026 (Monsoon Begin)' },
    { value: '2026-07', label: 'July 2026 (High Monsoon)' },
    { value: '2026-08', label: 'August 2026 (Monsoon Peak)' },
    { value: '2026-09', label: 'September 2026 (Monsoon End)' },
    { value: '2026-10', label: 'October 2026' },
  ];

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await api.ai.getPredictions(constituency, targetMonth);
      setPredResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [constituency, targetMonth]);

  const getRiskColor = (val: number) => {
    if (val >= 75) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (val >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (val >= 25) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8 bg-slate-950 text-slate-100">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-brand-500" />
            AI Predictive Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Machine learning forecast models predicting weather dependencies, infrastructural failures, and public health risk outbreaks.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex gap-3 bg-slate-900/60 p-2 rounded-2xl border border-white/5 items-center">
          <div className="flex items-center gap-2 px-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Constituency</span>
            <input
              type="text"
              value={constituency}
              onChange={e => setConstituency(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg w-28 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3 pr-2.5">
            <Calendar className="w-4.5 h-4.5 text-slate-500" />
            <select
              value={targetMonth}
              onChange={e => setTargetMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <GlassCard className="text-center py-32 border border-brand-500/10">
          <Cpu className="w-10 h-10 mx-auto text-brand-500 animate-spin mb-4" />
          <p className="font-bold text-slate-300">Computing forecasting models...</p>
          <p className="text-xs text-slate-500 mt-1">Simulating historical complaint records & satellite trends</p>
        </GlassCard>
      ) : predResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Risk factors grid */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-500" />
              Forecasted Risk Indicators ({targetMonth})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Flood Risk', val: predResult.floodRisk, desc: 'Blocked waterways' },
                { name: 'Water Shortage', val: predResult.waterShortage, desc: 'Groundwater drop' },
                { name: 'Road Damage', val: predResult.roadDamage, desc: 'Potholes after rain' },
                { name: 'Power Interrupts', val: predResult.electricityComplaints, desc: 'Grid overload' },
                { name: 'Garbage Backlog', val: predResult.garbageIssues, desc: 'Landfill blocks' },
                { name: 'Disease Outbreaks', val: predResult.diseaseOutbreaks, desc: 'Waterborne vectors' }
              ].map((item, idx) => (
                <GlassCard key={idx} className={`border p-4 text-center space-y-3 ${getRiskColor(item.val)}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.name}</span>
                  <div className="text-3xl font-black">{item.val}%</div>
                  <span className="text-[10px] font-semibold text-slate-500 block leading-tight">{item.desc}</span>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-current h-full rounded-full" style={{ width: `${item.val}%` }} />
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Historical trend charts */}
            <GlassCard className="border border-white/5 p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart className="w-5 h-5 text-brand-500" />
                Grievance Volume Projections (Actual vs Predicted)
              </h4>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predResult.trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="actual" stroke="#2563eb" name="Actual Grievances" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeDasharray="5 5" name="Predicted Volume (AI)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Reasoning & Predictions Panel */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="border border-brand-500/20 p-5 bg-brand-500/5 space-y-4">
              <h4 className="text-sm font-bold text-brand-400 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4.5 h-4.5 text-brand-500" />
                Predictive Reasoning
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 border border-white/5 rounded-xl">
                {predResult.reasoning}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase pt-1 border-t border-slate-900">
                <span>Model Confidence</span>
                <span className="text-brand-400">{predResult.predictionConfidence}% Accuracy</span>
              </div>
            </GlassCard>

            <GlassCard className="border border-white/5 p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-brand-500" />
                Action Directives
              </h4>
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <p>
                  <strong className="text-slate-300">Water Supply:</strong> Ground water recharge and solar pumps recommended in low-lying zones to handle seasonal scarcity spikes.
                </p>
                <p>
                  <strong className="text-slate-300">Road Transport:</strong> High rainfall predictions indicate early drainage clearances around school lanes are required to mitigate vehicle lockups.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">Could not compile predictive analyses.</div>
      )}
    </div>
  );
};
export default PredictiveDashboard;
