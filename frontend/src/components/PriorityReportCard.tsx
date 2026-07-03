import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingDown, Users, DollarSign, Calendar, Info, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

interface PriorityReportCardProps {
  report: {
    priorityScore: number;
    confidence: number;
    expectedImpact: string;
    risk: string;
    estimatedCost: number;
    estimatedCompletion: string;
    populationBenefited: number;
    rank: number;
    reasoning: string[];
  };
  explanation?: {
    topFactors: { factor: string; influenceScore: number }[];
    confidence: number;
    references: { title: string; source: string; snippet?: string }[];
    reasoning: string;
  } | null;
  riskReport?: {
    riskLevel: string;
    confidence: number;
    factors: { factor: string; riskWeight: number; mitigation: string }[];
    summary: string;
  } | null;
  impactReport?: {
    currentComplaints: number;
    predictedComplaints: number;
    budgetSaved: number;
    travelTimeReducedPercent: number;
    citizensBenefited: number;
    completionTimeline: string;
    overallImpactScore: number;
    reasoning: string;
  } | null;
}

export const PriorityReportCard: React.FC<PriorityReportCardProps> = ({
  report,
  explanation,
  riskReport,
  impactReport
}) => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'xai' | 'impact' | 'risk'>('ranking');

  // Format currency
  const formatCost = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`;
    }
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'high': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      default: return 'text-green-400 border-green-400/30 bg-green-400/10';
    }
  };

  return (
    <div className="w-full glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-slate-900/40">
      {/* Header Info */}
      <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center bg-gradient-to-r from-brand-900/20 to-slate-900/60 gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            AI Priority Report
          </span>
          <h3 className="text-xl font-extrabold text-slate-100 mt-2 flex items-center gap-2">
            Priority Evaluation Index
            <span className="text-sm font-semibold text-brand-400">Rank #{report.rank}</span>
          </h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-white/5">
          {(['ranking', 'xai', 'impact', 'risk'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'xai' ? 'Explainable AI' : tab === 'ranking' ? 'Ranking Engine' : tab === 'impact' ? 'Before/After' : 'Risk Meter'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Score Circular Gauge */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/20 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-4">Priority Score</p>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="60" className="stroke-slate-800" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="72" cy="72" r="60"
                      className="stroke-brand-500 transition-all duration-1000 ease-out"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={376.8}
                      strokeDashoffset={376.8 - (376.8 * report.priorityScore) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-100">{report.priorityScore}</span>
                    <span className="text-[10px] text-slate-500 font-bold">/ 100</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Confidence {report.confidence}%
                </div>
              </div>

              {/* KPIs & Specs */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated Cost</p>
                      <p className="text-base font-black text-slate-200">{formatCost(report.estimatedCost)}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completion</p>
                      <p className="text-base font-black text-slate-200">{report.estimatedCompletion}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pop. Benefited</p>
                      <p className="text-base font-black text-slate-200">{report.populationBenefited.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${getRiskColor(report.risk)}`}>
                    <div className="p-2.5 bg-white/5 rounded-lg">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">Risk Assessment</p>
                      <p className="text-base font-black capitalize">{report.risk}</p>
                    </div>
                  </div>
                </div>

                {/* Reasoning Points */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Priority Factors</p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {report.reasoning.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-400 font-black mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'xai' && (
            <motion.div
              key="xai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {explanation ? (
                <>
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
                    <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> AI Recommendation Reasoning
                    </p>
                    {explanation.reasoning}
                  </div>

                  {/* Factor Influence Chart */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Key Decision Drivers</p>
                    <div className="space-y-2">
                      {explanation.topFactors.map((factor, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-300">
                            <span>{factor.factor}</span>
                            <span>{factor.influenceScore}% Influence</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${factor.influenceScore}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* References & Citations */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Policy & Dataset References</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {explanation.references.map((ref, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/20 rounded-lg border border-white/5 text-xs space-y-1.5">
                          <p className="font-bold text-brand-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-brand-500" />
                            {ref.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ref.source}</p>
                          {ref.snippet && (
                            <p className="text-slate-400 italic bg-slate-950/40 p-2 rounded border border-white/5 text-[11px] leading-relaxed">
                              "{ref.snippet}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-semibold">No Explainable AI (XAI) data compiled.</div>
              )}
            </motion.div>
          )}

          {activeTab === 'impact' && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {impactReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before vs After Complaints Comparison */}
                  <div className="p-5 bg-slate-950/20 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated Complaint Resolution</p>
                    <div className="flex justify-between items-center text-center">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-red-400">Current Complaints</p>
                        <p className="text-4xl font-black text-slate-100 mt-2">{impactReport.currentComplaints}</p>
                      </div>
                      <div className="text-slate-600 font-black text-lg">➔</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-400">Predicted Future</p>
                        <p className="text-4xl font-black text-slate-100 mt-2">{impactReport.predictedComplaints}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs font-semibold text-emerald-400 text-center">
                      Expected Complaint Reduction Rate: {Math.round(((impactReport.currentComplaints - impactReport.predictedComplaints) / (impactReport.currentComplaints || 1)) * 100)}%
                    </div>
                  </div>

                  {/* Impact Statistics */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Travel Delay Reduction</p>
                        <p className="text-base font-black text-slate-200">{impactReport.travelTimeReducedPercent}% Faster Transit</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Constituency Budget Saved</p>
                        <p className="text-base font-black text-slate-200">{formatCost(impactReport.budgetSaved)} Saved</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/20 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className="p-2.5 bg-brand-500/10 rounded-lg text-brand-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Citizens Impacted</p>
                        <p className="text-base font-black text-slate-200">{impactReport.citizensBenefited.toLocaleString()} Benefited</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 p-4 bg-slate-950/40 rounded-xl border border-white/5 text-xs text-slate-300">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Impact Analysis Summary</p>
                    {impactReport.reasoning}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-semibold">No before-vs-after impact reports available.</div>
              )}
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {riskReport ? (
                <div className="space-y-6">
                  {/* Gauge Risk Indicator */}
                  <div className="p-4 bg-slate-950/20 rounded-2xl border border-white/5 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Risk Index</p>
                      <h4 className={`text-2xl font-black mt-1 capitalize ${
                        riskReport.riskLevel.toLowerCase() === 'critical' ? 'text-red-500' :
                        riskReport.riskLevel.toLowerCase() === 'high' ? 'text-orange-500' :
                        riskReport.riskLevel.toLowerCase() === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {riskReport.riskLevel} Level Risk
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                        <span
                          key={level}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded border ${
                            riskReport.riskLevel.toLowerCase() === level.toLowerCase()
                              ? getRiskColor(level)
                              : 'text-slate-600 border-white/5 bg-transparent'
                          }`}
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Factor Mitigation Table */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Risk Factors & AI-Proposed Mitigations</p>
                    <div className="space-y-3">
                      {riskReport.factors.map((factor, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/20 rounded-xl border border-white/5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                              {factor.factor}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Weight: {factor.riskWeight}%</span>
                          </div>
                          <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded border border-white/5 leading-relaxed">
                            <strong className="text-emerald-400">Proposed Mitigation: </strong>
                            {factor.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">{riskReport.summary}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-semibold">No detailed risk assessments generated.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
