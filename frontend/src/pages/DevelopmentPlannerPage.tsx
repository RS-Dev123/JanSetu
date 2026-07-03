import React, { useState } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { LayoutGrid, Cpu, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const DevelopmentPlannerPage: React.FC = () => {
  const [budget, setBudget] = useState(50000000); // 5 Crore default
  const [timelineMonths, setTimelineMonths] = useState(12);
  const [departments, setDepartments] = useState<string[]>(['PWD', 'Water']);
  const [district, setDistrict] = useState('New Delhi');
  const [village, setVillage] = useState('Daryaganj');
  const [population, setPopulation] = useState(45000);
  
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);

  const availableDepts = ['PWD', 'Water', 'Health', 'Education', 'Electricity', 'Municipality'];

  const toggleDept = (dept: string) => {
    setDepartments(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.ai.planDevelopment({
        budget,
        timelineMonths,
        departments,
        district,
        village,
        population
      });
      setPlanResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Pie chart data formatting
  const pieData = planResult?.budgetSplit 
    ? Object.entries(planResult.budgetSplit).map(([cat, val]) => ({ name: cat, value: val }))
    : [];

  const COLORS = ['#2563eb', '#06b6d4', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8 bg-slate-950 text-slate-100">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-brand-500" />
          AI Development Planner
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Input your budget, timeframe, and departments to generate a comprehensive local constituency developmental plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <div className="lg:col-span-4">
          <GlassCard className="border border-white/5 p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-brand-500" />
              Planning Constraints
            </h3>
            
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Allocated Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500/50 outline-none text-slate-200 pl-8 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Timeline Target (Months)</label>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={timelineMonths}
                  onChange={e => setTimelineMonths(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 font-semibold px-0.5">
                  <span>2 M</span>
                  <span className="text-brand-400 font-bold">{timelineMonths} Months Target</span>
                  <span>24 M</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Location details</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">District</span>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 outline-none text-slate-200 px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">Village/Ward</span>
                    <input
                      type="text"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 outline-none text-slate-200 px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Population</label>
                <input
                  type="number"
                  value={population}
                  onChange={e => setPopulation(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 outline-none text-slate-200 px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Executing Departments</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableDepts.map(d => {
                    const active = departments.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDept(d)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                            : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
              >
                <Cpu className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Compiling AI Scenarios...' : 'Generate Plan'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <GlassCard className="text-center py-24 text-slate-500 border border-brand-500/10">
              <Cpu className="w-10 h-10 mx-auto text-brand-500 animate-spin mb-4" />
              <p className="font-bold text-slate-300">Evaluating multi-department resource links...</p>
              <p className="text-xs text-slate-500 mt-1">Cross-referencing RAG guidelines and ward priority scales</p>
            </GlassCard>
          ) : planResult ? (
            <div className="space-y-6">
              {/* Executive summary block */}
              <GlassCard className="border border-brand-500/20 p-6 bg-brand-500/5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/25">
                  AI Planning Advisor Summary
                </span>
                <p className="text-sm font-semibold text-slate-300 mt-3 leading-relaxed">
                  "For the constituency of {district}, I recommend launching the following developmental projects inside a budget allocation of {formatCurrency(budget)}. We prioritize water and road networks, helping an estimated {population.toLocaleString()} residents and aiming to resolve over 40% of standard municipal complaints."
                </p>
              </GlassCard>

              {/* Recommended Projects list */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Recommended Core Projects
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planResult.bestProjects.map((p: any, idx: number) => (
                    <GlassCard key={idx} className="border border-white/5 p-5 space-y-4 hover:border-brand-500/20 transition-all">
                      <div>
                        <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest px-2 py-0.5 bg-brand-500/10 rounded-full border border-brand-500/20">
                          {p.category}
                        </span>
                        <h5 className="font-bold text-slate-100 mt-2">{p.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-900">
                        <span>Cost: <strong className="text-slate-300">{formatCurrency(p.cost)}</strong></span>
                        <span className="px-2 py-0.5 bg-slate-950 text-brand-400 border border-brand-500/10 rounded font-semibold text-[10px]">
                          {p.department}
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Budget Allocation Pie Chart & Phased Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart Card */}
                <GlassCard className="border border-white/5 p-5 space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Division</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* Timeline Phases */}
                <GlassCard className="border border-white/5 p-5 space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Execution Phases</p>
                  
                  <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {planResult.phases.map((ph: any, idx: number) => (
                      <div key={idx} className="relative space-y-1">
                        <span className="absolute -left-4 w-3.5 h-3.5 rounded-full bg-brand-500 border-4 border-slate-950 mt-0.5" />
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{ph.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ph.duration}
                          </span>
                        </div>
                        <ul className="text-[11px] text-slate-400 list-disc pl-3">
                          {ph.activities.map((act: string, aIdx: number) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Execution Order list */}
              <div className="p-5 bg-slate-950/40 rounded-2xl border border-white/5 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Project Execution Order</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {planResult.executionOrder.map((proj: string, idx: number) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-700">➔</span>}
                      <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                        {idx + 1}. {proj}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <GlassCard className="text-center py-24 text-slate-600 border border-dashed border-slate-800">
              <Briefcase className="w-12 h-12 mx-auto text-slate-700 mb-3 animate-pulse" />
              <p className="font-semibold text-slate-400">Planner Dashboard Ready</p>
              <p className="text-xs text-slate-600 mt-1">Adjust constraints on the left and click "Generate Plan" to compile AI recommendation schedules.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
