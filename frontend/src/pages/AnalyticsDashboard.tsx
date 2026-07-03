import React, { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { GlassCard } from '../components/GlassCard';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FileText, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Users, Zap
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Roads & Transport': '#3b82f6',
  'Water Supply': '#06b6d4',
  'Electricity & Power': '#f59e0b',
  'Sanitation & Waste': '#10b981',
  'Healthcare': '#ef4444',
  'Education': '#8b5cf6',
  'Public Spaces': '#f97316',
  'Other': '#6b7280',
};

const URGENCY_COLORS: Record<string, string> = {
  'low': '#10b981',
  'medium': '#f59e0b',
  'high': '#f97316',
  'critical': '#ef4444',
};

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, color }) => (
  <GlassCard hoverGlow className="border border-white/5 flex items-center gap-5 glow-card">
    <div className={`p-4 rounded-2xl shrink-0`} style={{ background: `${color}15` }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-100 mt-1">{value}</h3>
      {trend !== undefined && (
        <p className={`text-xs font-semibold flex items-center gap-1 mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-3 py-2 rounded-lg border border-white/10 text-xs">
        <p className="font-bold text-slate-300 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsDashboard: React.FC = () => {
  const { submissions, refreshData } = useDB();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [urgencyData, setUrgencyData] = useState<any[]>([]);
  const [topDistricts, setTopDistricts] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    if (!submissions.length) return;

    // Monthly trend (last 6 months)
    const months: Record<string, { month: string; total: number; resolved: number; pending: number; critical: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('default', { month: 'short' });
      months[key] = { month: label, total: 0, resolved: 0, pending: 0, critical: 0 };
    }
    submissions.forEach(s => {
      const key = s.createdAt.slice(0, 7);
      if (months[key]) {
        months[key].total++;
        if (s.status === 'resolved') months[key].resolved++;
        if (s.status === 'pending') months[key].pending++;
        if (s.urgency === 'critical') months[key].critical++;
      }
    });
    setMonthlyData(Object.values(months));

    // Category distribution
    const catCount: Record<string, number> = {};
    submissions.forEach(s => {
      catCount[s.category] = (catCount[s.category] || 0) + 1;
    });
    setCategoryData(Object.entries(catCount).map(([name, value]) => ({ name, value })));

    // Urgency distribution
    const urg: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    submissions.forEach(s => { urg[s.urgency]++; });
    setUrgencyData(Object.entries(urg).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), value
    })));

    // Top districts
    const distCount: Record<string, number> = {};
    submissions.forEach(s => {
      const d = s.location?.district || 'Unknown';
      distCount[d] = (distCount[d] || 0) + 1;
    });
    setTopDistricts(
      Object.entries(distCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    );
  }, [submissions]);

  // KPI calculations
  const total = submissions.length;
  const resolved = submissions.filter(s => s.status === 'resolved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const urgent = submissions.filter(s => s.urgency === 'critical' || s.urgency === 'high').length;
  const avgScore = total
    ? Math.round(submissions.reduce((a, s) => a + s.priorityScore, 0) / total)
    : 0;

  // Prediction — simple linear extrapolation
  const lastTwo = monthlyData.slice(-2);
  const predictedNext = lastTwo.length === 2
    ? Math.max(0, lastTwo[1].total + (lastTwo[1].total - lastTwo[0].total))
    : 0;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Saffron Top Accent Line */}
      <div className="saffron-accent-line w-full h-[2px] shrink-0" />
      
      <div className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Analytics Dashboard
        </h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Real-time constituency intelligence. AI-powered insights into citizen demand patterns.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Submissions" value={total} icon={<FileText className="w-6 h-6" />} color="#2a99ff" trend={12} />
        <KPICard title="Resolved" value={resolved} icon={<CheckCircle2 className="w-6 h-6" />} color="#10b981" trend={8} />
        <KPICard title="Pending Review" value={pending} icon={<Clock className="w-6 h-6" />} color="#f59e0b" trend={-3} />
        <KPICard title="Urgent / Critical" value={urgent} icon={<AlertTriangle className="w-6 h-6" />} color="#ef4444" trend={5} />
      </div>

      {/* Prediction Banner */}
      <GlassCard className="border border-brand-500/20 bg-brand-500/5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-500/15 rounded-xl">
            <Zap className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">AI Prediction</p>
            <h4 className="text-lg font-bold text-slate-200">
              {predictedNext > 0 ? `~${predictedNext} new submissions` : 'Insufficient data for prediction'} expected next month
            </h4>
          </div>
        </div>
        <div className="flex gap-6 text-center shrink-0">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Avg Priority</p>
            <p className="text-2xl font-black text-brand-400">{avgScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Resolution Rate</p>
            <p className="text-2xl font-black text-emerald-400">
              {total ? Math.round((resolved / total) * 100) : 0}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Critical Rate</p>
            <p className="text-2xl font-black text-red-400">
              {total ? Math.round((urgent / total) * 100) : 0}%
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends */}
        <GlassCard className="lg:col-span-2 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Monthly Submission Trends</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a99ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2a99ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#2a99ff" fill="url(#gradTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="url(#gradResolved)" strokeWidth={2} />
                <Area type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet. Submit grievances to see trends.</div>
          )}
        </GlassCard>

        {/* Category Pie */}
        <GlassCard className="border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Category Distribution</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {categoryData.slice(0, 4).map(d => (
                  <div key={d.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[d.name] || '#6b7280' }}></div>
                      <span className="text-slate-400 truncate max-w-28">{d.name}</span>
                    </div>
                    <span className="text-slate-200 font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data</div>
          )}
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Bar Chart */}
        <GlassCard className="border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Urgency Level Distribution</h3>
          {urgencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={urgencyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                  {urgencyData.map((entry) => (
                    <Cell key={entry.name} fill={URGENCY_COLORS[entry.name.toLowerCase()] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data</div>
          )}
        </GlassCard>

        {/* Top Districts */}
        <GlassCard className="border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            Top Districts by Volume
          </h3>
          <div className="space-y-3">
            {topDistricts.length > 0 ? topDistricts.map((d, idx) => {
              const maxCount = topDistricts[0]?.count || 1;
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{idx + 1}. {d.name}</span>
                    <span className="text-slate-400">{d.count} submissions</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-slate-600 text-sm py-8">No district data available</div>
            )}
          </div>
        </GlassCard>
      </div>
      </div>
    </div>
  );
};
