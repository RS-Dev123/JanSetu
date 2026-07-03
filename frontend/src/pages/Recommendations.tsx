import React, { useState, useEffect } from 'react';
import { useDB } from '../context/DBContext';
import { GlassCard } from '../components/GlassCard';
import { PriorityReportCard } from '../components/PriorityReportCard';
import { api } from '../services/api';
import { 
  Cpu, 
  Check, 
  X, 
  DollarSign, 
  Users, 
  FileCheck2,
  ListCollapse,
  Info
} from 'lucide-react';

export const Recommendations: React.FC = () => {
  const { recommendations, loadingRecommendations, refreshData, generateRecs, approveRec } = useDB();
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const selectedRec = recommendations.find(r => r.id === selectedRecId);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (selectedRecId && selectedRec && selectedRec.linkedSubmissions?.length > 0) {
      setLoadingReport(true);
      api.ai.getPriorityReport(selectedRec.linkedSubmissions[0])
        .then(res => {
          setReportData(res);
        })
        .catch(err => {
          console.error('Error fetching priority report:', err);
          setReportData(null);
        })
        .finally(() => {
          setLoadingReport(false);
        });
    } else {
      setReportData(null);
    }
  }, [selectedRecId, selectedRec]);

  const handleGenerate = async () => {
    setScanning(true);
    setScanProgress(15);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 15;
      });
    }, 400);

    try {
      await generateRecs();
      setScanProgress(100);
      setTimeout(() => {
        setScanning(false);
        setScanProgress(0);
      }, 500);
    } catch (err) {
      console.error(err);
      setScanning(false);
      setScanProgress(0);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await approveRec(id, action);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Aggregates
  const totalProposedBudget = recommendations
    .filter(r => r.status === 'proposed')
    .reduce((acc, r) => acc + r.estimatedBudget, 0);
  const totalApprovedBudget = recommendations
    .filter(r => r.status === 'approved')
    .reduce((acc, r) => acc + r.estimatedBudget, 0);
  const totalImpactedPop = recommendations
    .filter(r => r.status === 'approved')
    .reduce((acc, r) => acc + r.populationImpact, 0);

  const getFallbackReport = () => {
    if (!selectedRec) return null;
    return {
      report: {
        priorityScore: selectedRec.priorityScore || 75,
        confidence: selectedRec.confidenceScore || 85,
        expectedImpact: selectedRec.populationImpact > 10000 ? 'Very High' : 'High',
        risk: selectedRec.riskAnalysis?.toLowerCase().includes('high') ? 'High' : 'Medium',
        estimatedCost: selectedRec.estimatedBudget || 1500000,
        estimatedCompletion: selectedRec.estimatedTimeline || '3 Months',
        populationBenefited: selectedRec.populationImpact || 1200,
        rank: 1,
        reasoning: [selectedRec.reasoning]
      },
      explanation: {
        topFactors: [
          { factor: 'Citizen demand volume', influenceScore: 45 },
          { factor: 'Constituency gap statistics', influenceScore: 35 },
          { factor: 'Urgency / health safety score', influenceScore: 20 }
        ],
        confidence: selectedRec.confidenceScore || 85,
        references: selectedRec.retrievedDocuments.map(doc => ({ title: doc, source: 'Policy Guidelines' })),
        reasoning: selectedRec.reasoning
      },
      riskReport: {
        riskLevel: selectedRec.riskAnalysis?.toLowerCase().includes('high') ? 'High' : 'Medium',
        confidence: 85,
        factors: [
          { factor: 'Implementation Logistics', riskWeight: 45, mitigation: 'Schedule site clearance early.' },
          { factor: 'Weather Constraints', riskWeight: 50, mitigation: 'Plan earthworks in dry months.' }
        ],
        summary: selectedRec.riskAnalysis
      },
      impactReport: {
        currentComplaints: selectedRec.linkedSubmissions?.length * 5 || 25,
        predictedComplaints: 2,
        budgetSaved: Math.round(selectedRec.estimatedBudget * 0.15),
        travelTimeReducedPercent: selectedRec.category === 'Roads & Transport' ? 35 : 5,
        citizensBenefited: selectedRec.populationImpact || 1200,
        completionTimeline: selectedRec.estimatedTimeline || '3 Months',
        overallImpactScore: selectedRec.priorityScore || 85,
        reasoning: selectedRec.benefits
      }
    };
  };

  const finalReport = reportData || getFallbackReport();

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8 relative bg-slate-950">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            AI Development Project Planner
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            Evaluate constituency priority works dynamically calculated from citizen demands, local gap metrics, and central policies.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={scanning || loadingRecommendations}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 active:transform active:scale-[0.98] text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
        >
          <Cpu className={`w-4.5 h-4.5 ${scanning ? 'animate-spin' : ''}`} />
          Run AI Project Scan
        </button>
      </div>

      {/* Scanning status bar */}
      {scanning && (
        <GlassCard className="border border-brand-500/20 py-4 px-6 bg-brand-500/5">
          <div className="flex justify-between text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
            <span>Analyzing local public gaps & RAG guidelines...</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </GlassCard>
      )}

      {/* KPI stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard hoverGlow className="flex items-center gap-5 border border-white/5">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Proposed Allocation</span>
            <h3 className="text-xl font-bold mt-1 text-slate-200">{formatCurrency(totalProposedBudget)}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverGlow className="flex items-center gap-5 border border-white/5">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Approved Budget</span>
            <h3 className="text-xl font-bold mt-1 text-emerald-400">{formatCurrency(totalApprovedBudget)}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverGlow className="flex items-center gap-5 border border-white/5">
          <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Approved Target Beneficiaries</span>
            <h3 className="text-xl font-bold mt-1 text-slate-200">{totalImpactedPop.toLocaleString()} Citizens</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recommendations list */}
        <div className={`space-y-4 ${selectedRecId ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          {loadingRecommendations && recommendations.length === 0 ? (
            <div className="text-center py-20 text-slate-500">Loading priority recommendation works...</div>
          ) : recommendations.length === 0 ? (
            <GlassCard className="text-center py-20 text-slate-500 border border-dashed border-slate-800">
              <Info className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-slate-400">No project works proposed yet.</p>
              <p className="text-xs text-slate-600 mt-1">Click "Run AI Project Scan" above to analyze and generate suggestions.</p>
            </GlassCard>
          ) : (
            recommendations.map(rec => (
              <GlassCard 
                key={rec.id}
                hoverGlow
                className={`border cursor-pointer transition-all duration-200 ${
                  selectedRecId === rec.id 
                    ? 'border-brand-500/50 bg-slate-900/60 shadow-lg shadow-brand-500/5' 
                    : 'border-white/5'
                }`}
              >
                <div onClick={() => setSelectedRecId(selectedRecId === rec.id ? null : rec.id)} className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest px-2.5 py-0.5 bg-brand-500/10 rounded-full border border-brand-500/20">
                        {rec.category}
                      </span>
                      <h4 className="text-lg font-bold text-slate-200 mt-2">{rec.title}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-500 font-bold uppercase block">Priority</span>
                      <span className="text-2xl font-black text-brand-500">{rec.priorityScore}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2">{rec.description}</p>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-4">
                      <span>Impact: <b className="text-slate-300">{rec.populationImpact} pop</b></span>
                      <span>Budget: <b className="text-slate-300">{formatCurrency(rec.estimatedBudget)}</b></span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        rec.status === 'approved' 
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                          : rec.status === 'rejected'
                          ? 'bg-red-500/10 border-red-500/25 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                </div>

                {rec.status === 'proposed' && (
                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-800/85">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(rec.id, 'rejected');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(rec.id, 'approved');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/25"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Works
                    </button>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>

        {/* Selected Recommendation Details Drawer */}
        {selectedRecId && selectedRec && (
          <div className="lg:col-span-6 sticky top-8 space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              <span className="text-sm font-bold text-slate-300 line-clamp-1">Details: {selectedRec.title}</span>
              <button 
                onClick={() => setSelectedRecId(null)}
                className="p-1.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg text-slate-400 shrink-0"
              >
                <ListCollapse className="w-4 h-4" />
              </button>
            </div>
            {loadingReport ? (
              <div className="text-center py-20 text-slate-500 font-semibold glass-panel rounded-3xl border border-white/5">
                Computing AI explainability matrices...
              </div>
            ) : finalReport ? (
              <PriorityReportCard
                report={finalReport.report}
                explanation={finalReport.explanation}
                riskReport={finalReport.riskReport}
                impactReport={finalReport.impactReport}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
export default Recommendations;
