import React, { useState } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { Cpu, Sparkles, Sliders, Play, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const ScenarioSimulatorPage: React.FC = () => {
  const [schools, setSchools] = useState(2);
  const [roads, setRoads] = useState(5);
  const [bridges, setBridges] = useState(1);
  const [solarPlants, setSolarPlants] = useState(10);
  const [waterTanks, setWaterTanks] = useState(3);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.ai.simulateScenario({
        schools,
        roads,
        bridges,
        solarPlants,
        waterTanks
      });
      setSimResult(res);
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

  // Recharts bar chart formatting
  const chartData = simResult
    ? [
        { name: 'Travel Time Reduc.', score: simResult.travelTimeReducedPercent || simResult.travelReductionPercent || 0 },
        { name: 'Education Gain', score: simResult.educationImprovementPercent || 0 },
        { name: 'Water Coverage', score: simResult.waterAccessImprovementPercent || 0 },
        { name: 'Health Access', score: simResult.healthAccessImprovementPercent || 0 },
        { name: 'Complaint Reduc.', score: simResult.complaintReductionPercent || 0 }
      ]
    : [];

  const handlePrintScenario = () => {
    if (!simResult) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>AI Scenario Simulation Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
            .kpi { display: flex; gap: 20px; margin-bottom: 30px; }
            .kpi-card { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .val { font-size: 24px; font-weight: bold; color: #2563eb; }
            pre { font-family: inherit; white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h2>🏛️ AI "What If" Scenario Simulation Report</h2>
          <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          <hr/>
          <h3>Simulated Infrastructure Additions:</h3>
          <ul>
            <li>Schools Built: ${schools}</li>
            <li>Roads Laid: ${roads} km</li>
            <li>Bridges Constructed: ${bridges}</li>
            <li>Solar Street Plants Installed: ${solarPlants}</li>
            <li>Water Reservoirs Mounted: ${waterTanks}</li>
          </ul>

          <div class="kpi">
            <div class="kpi-card"><p>Budget Required</p><p class="val">${formatCurrency(simResult.budgetRequired)}</p></div>
            <div class="kpi-card"><p>Completion Timeline</p><p class="val">${simResult.timelineMonths} Months</p></div>
            <div class="kpi-card"><p>Helped Population</p><p class="val">${simResult.populationHelped.toLocaleString()}</p></div>
          </div>

          <h3>Socio-Economic AI Impact Projections:</h3>
          <ul>
            <li>Transit Latency Reduction: ${simResult.travelTimeReducedPercent || simResult.travelReductionPercent || 0}%</li>
            <li>Educational Index Improvement: ${simResult.educationImprovementPercent}%</li>
            <li>Water Pipeline Reach Increase: ${simResult.waterAccessImprovementPercent}%</li>
            <li>Direct Complaint Reduction: ${simResult.complaintReductionPercent}%</li>
            <li>Overall Economic Gain Scale: ${simResult.economicImpact}</li>
          </ul>

          <h3>AI Contextual Reasoning:</h3>
          <pre>${simResult.reasoning}</pre>
          <script>window.onload = () => window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8 bg-slate-950 text-slate-100">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
          AI Scenario Simulator ("What-If")
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Model future developmental plans by adjusting potential construction deliverables. AI computes expected socio-economic impacts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-4">
          <GlassCard className="border border-white/5 p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-500" />
              Scenario Controls
            </h3>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Build Schools</span>
                  <span className="text-brand-400">{schools} Schools</span>
                </div>
                <input
                  type="range" min="0" max="10" value={schools}
                  onChange={e => setSchools(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-850 rounded"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Lay Roads (km)</span>
                  <span className="text-brand-400">{roads} km Paved</span>
                </div>
                <input
                  type="range" min="0" max="50" value={roads}
                  onChange={e => setRoads(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-850 rounded"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Construct Bridges</span>
                  <span className="text-brand-400">{bridges} Bridges</span>
                </div>
                <input
                  type="range" min="0" max="5" value={bridges}
                  onChange={e => setBridges(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-850 rounded"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Solar street units</span>
                  <span className="text-brand-400">{solarPlants} Units</span>
                </div>
                <input
                  type="range" min="0" max="30" value={solarPlants}
                  onChange={e => setSolarPlants(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-850 rounded"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Water Reservoir Tanks</span>
                  <span className="text-brand-400">{waterTanks} Reservoirs</span>
                </div>
                <input
                  type="range" min="0" max="20" value={waterTanks}
                  onChange={e => setWaterTanks(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-850 rounded"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                {loading ? 'Simulating Social Dynamics...' : 'Execute Simulator'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results Graph Panel */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <GlassCard className="text-center py-28 text-slate-500 border border-brand-500/10">
              <Cpu className="w-10 h-10 mx-auto text-brand-500 animate-spin mb-4" />
              <p className="font-bold text-slate-300">Calculating what-if scenarios...</p>
              <p className="text-xs text-slate-500 mt-1">Modeling linear budget splits and accessibility impacts</p>
            </GlassCard>
          ) : simResult ? (
            <div className="space-y-6">
              {/* KPI metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-4 border border-white/5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Cost</span>
                  <p className="text-sm font-black text-brand-400 mt-1">{formatCurrency(simResult.budgetRequired)}</p>
                </GlassCard>

                <GlassCard className="p-4 border border-white/5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Timeline Needed</span>
                  <p className="text-sm font-black text-slate-200 mt-1">{simResult.timelineMonths} Months</p>
                </GlassCard>

                <GlassCard className="p-4 border border-white/5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Citizens Helped</span>
                  <p className="text-sm font-black text-slate-200 mt-1">{simResult.populationHelped.toLocaleString()}</p>
                </GlassCard>

                <GlassCard className="p-4 border border-white/5 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Economic Impact</span>
                  <p className="text-sm font-black text-emerald-400 mt-1">{simResult.economicImpact}</p>
                </GlassCard>
              </div>

              {/* Chart of sub impacts */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <GlassCard className="md:col-span-7 border border-white/5 p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Socio-Economic Impact Score splits</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar dataKey="score" fill="#06b6d4" name="Impact Percentage %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* Progress bars metrics */}
                <GlassCard className="md:col-span-5 border border-white/5 p-5 space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Sector Gains</p>
                  <div className="space-y-3">
                    {[
                      { name: 'Travel delay reduction', val: simResult.travelTimeReducedPercent || simResult.travelReductionPercent || 0 },
                      { name: 'Education reach index', val: simResult.educationImprovementPercent || 0 },
                      { name: 'Clean water coverage', val: simResult.waterAccessImprovementPercent || 0 },
                      { name: 'Direct complaint drop', val: simResult.complaintReductionPercent || 0 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                          <span>{item.name}</span>
                          <span className="text-brand-400">+{item.val}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-brand-500 h-full rounded-full" style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Print action and explanation reasoning */}
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-wrap justify-between items-center gap-4">
                <div className="flex-1 text-xs text-slate-400 pr-4 leading-relaxed">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">AI Simulation Context</p>
                  {simResult.reasoning}
                </div>
                <button
                  onClick={handlePrintScenario}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" /> Download PDF Report
                </button>
              </div>
            </div>
          ) : (
            <GlassCard className="text-center py-24 text-slate-600 border border-dashed border-slate-800">
              <Sparkles className="w-12 h-12 mx-auto text-slate-700 mb-3 animate-pulse" />
              <p className="font-semibold text-slate-400">Scenario Simulator Ready</p>
              <p className="text-xs text-slate-600 mt-1">Adjust schools, roads, or reservoirs on the left controls and click "Execute Simulator" to run predictive algorithms.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
export default ScenarioSimulatorPage;
