import React, { useState } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { DollarSign, Cpu, TrendingUp, CheckCircle, PieChart as ChartIcon, Settings, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const BudgetOptimizerPage: React.FC = () => {
  const [totalBudget, setTotalBudget] = useState(50000000); // 5 Crore
  const [constituency, setConstituency] = useState('New Delhi');
  const [categories, setCategories] = useState<string[]>([
    'Roads & Transport', 'Water Supply', 'Sanitation & Waste', 'Education', 'Electricity & Power'
  ]);
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  const availableCategories = [
    'Roads & Transport', 'Water Supply', 'Sanitation & Waste', 'Education', 'Healthcare', 'Electricity & Power'
  ];

  const handleToggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.ai.optimizeBudget(totalBudget, constituency, categories);
      setOptResult(res);
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

  // Bar chart data format
  const chartData = optResult?.allocations
    ? optResult.allocations.map((a: any) => ({
        name: a.category.split(' ')[0],
        Amount: a.amount,
        Reduced: a.expectedComplaintsReducedPercent
      }))
    : [];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8 bg-slate-950 text-slate-100">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-brand-500" />
          AI Budget Optimizer
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Perform analytical cost-benefit budget allocations. AI maximizes public benefit metrics based on ward priorities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Panel */}
        <div className="lg:col-span-4">
          <GlassCard className="border border-white/5 p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-500" />
              Optimization Bounds
            </h3>

            <form onSubmit={handleOptimize} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Available Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={e => setTotalBudget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500/50 outline-none text-slate-200 pl-8 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Constituency / District</label>
                <input
                  type="text"
                  value={constituency}
                  onChange={e => setConstituency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500/50 outline-none text-slate-200 px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Categories</label>
                <div className="flex flex-col gap-2">
                  {availableCategories.map(cat => {
                    const active = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className={`text-left text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all flex justify-between items-center ${
                          active
                            ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                            : 'bg-slate-900 border-slate-800/80 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                        {active && <span className="w-2 h-2 rounded-full bg-brand-500" />}
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
                {loading ? 'Running Optimization Engine...' : 'Run Optimization'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <GlassCard className="text-center py-24 text-slate-500 border border-brand-500/10">
              <Cpu className="w-10 h-10 mx-auto text-brand-500 animate-spin mb-4" />
              <p className="font-bold text-slate-300">Applying resource allocations and linear algorithms...</p>
              <p className="text-xs text-slate-500 mt-1">AI modeling expected grievance volume drops</p>
            </GlassCard>
          ) : optResult ? (
            <div className="space-y-6">
              {/* Allocations Summary Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Remaining Budget</span>
                    <h4 className="text-base font-black text-slate-200">{formatCurrency(optResult.remainingBudget)}</h4>
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Impact Score</span>
                    <h4 className="text-base font-black text-brand-400">{optResult.overallImpactScore}/100</h4>
                  </div>
                </GlassCard>

                <GlassCard className="p-4 border border-white/5 flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Citizens Benefited</span>
                    <h4 className="text-base font-black text-slate-200">{optResult.totalPopulationBenefited.toLocaleString()}</h4>
                  </div>
                </GlassCard>
              </div>

              {/* Allocation table details */}
              <GlassCard className="border border-white/5 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ChartIcon className="w-5 h-5 text-brand-500" />
                  Sector Allocation Grid
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5">Category</th>
                        <th className="py-2.5">Suggested Cost</th>
                        <th className="py-2.5">Benefited Pop</th>
                        <th className="py-2.5">Complaints Reduced</th>
                        <th className="py-2.5">Reasoning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {optResult.allocations.map((a: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 font-bold text-slate-200">{a.category}</td>
                          <td className="py-3 font-black text-brand-400">{formatCurrency(a.amount)}</td>
                          <td className="py-3">{a.populationBenefited.toLocaleString()}</td>
                          <td className="py-3 text-emerald-400">-{a.expectedComplaintsReducedPercent}%</td>
                          <td className="py-3 text-slate-400 max-w-xs">{a.reasoning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Allocations Charts */}
              <GlassCard className="border border-white/5 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Allocated Budget Amounts (Recharts)</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip formatter={(value) => typeof value === 'number' && value > 100 ? formatCurrency(value) : `${value}%`} />
                      <Legend />
                      <Bar dataKey="Amount" fill="#2563eb" name="Budget (INR)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Policy Recommendations checklist */}
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-brand-500" />
                  Budget Distribution Directives
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-1">
                  {optResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-brand-500 font-black mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <GlassCard className="text-center py-24 text-slate-600 border border-dashed border-slate-800">
              <DollarSign className="w-12 h-12 mx-auto text-slate-700 mb-3 animate-pulse" />
              <p className="font-semibold text-slate-400">Budget Optimizer Ready</p>
              <p className="text-xs text-slate-600 mt-1">Specify total MP funding constraints on the left and run the evaluation script.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
