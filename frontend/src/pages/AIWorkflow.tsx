import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useDB } from '../context/DBContext';
import {
  Globe, ArrowRight, Eye, Heart, Copy, Hash, Star, Lightbulb,
  FileText, CheckCircle2, Loader2, Clock, Cpu
} from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'idle' | 'running' | 'done' | 'error';
  executionMs?: number;
  confidence?: number;
  output?: string;
}

const initialSteps: Omit<AgentStep, 'status'>[] = [
  { id: 'lang', name: 'Language Detection', description: 'Detects language and translates to English', icon: <Globe className="w-5 h-5" />, },
  { id: 'ocr', name: 'Image Understanding', description: 'OCR + visual scene classification via Gemini Vision', icon: <Eye className="w-5 h-5" />, },
  { id: 'audio', name: 'Audio Transcription', description: 'Speech-to-text transcription of voice note', icon: <span className="text-lg">🎙️</span>, },
  { id: 'sentiment', name: 'Sentiment & Urgency', description: 'Evaluates citizen emotion and health/safety urgency', icon: <Heart className="w-5 h-5" />, },
  { id: 'duplicate', name: 'Duplicate Detection', description: 'Cosine-similarity search across recent submissions', icon: <Copy className="w-5 h-5" />, },
  { id: 'cluster', name: 'Topic Clustering', description: 'Groups similar issues to reveal systemic patterns', icon: <Hash className="w-5 h-5" />, },
  { id: 'score', name: 'Priority Scoring', description: 'Calculates priority score using multi-factor weights', icon: <Star className="w-5 h-5" />, },
  { id: 'scheme', name: 'Scheme Matching', description: 'Matches complaints with national government programs', icon: <Lightbulb className="w-5 h-5" />, },
  { id: 'rec', name: 'Recommendation Generation', description: 'Generates development project proposals with budget', icon: <FileText className="w-5 h-5" />, },
  { id: 'report', name: 'Report Compilation', description: 'Compiles AI insights into exportable summary', icon: <CheckCircle2 className="w-5 h-5" />, },
];

const SAMPLE_OUTPUTS: Record<string, string> = {
  lang: '{"detectedLanguage": "Hindi", "englishTranslation": "Water supply pipe broken near Main Street", "confidence": 97}',
  ocr: '{"ocrText": "DANGER ZONE", "visualSummary": "Broken water pipe visible with visible flooding and road erosion", "confidence": 92}',
  audio: '{"transcript": "Voice: Water has not come for 3 days. Several children fell sick.", "confidence": 88}',
  sentiment: '{"sentiment": "negative", "urgency": "critical", "urgencyReasoning": "Health risk due to water contamination", "confidence": 95}',
  duplicate: '{"isDuplicate": true, "matchingComplaints": [{"id": "sub_x92k", "similarityScore": 84}], "confidence": 90}',
  cluster: '{"clusterId": "water-main-ward7", "clusterSize": 8, "dominantCategory": "Water Supply", "confidence": 89}',
  score: '{"priorityScore": 87, "infrastructureGapIndex": 8, "affectedPopulation": 1250, "confidence": 94}',
  scheme: '{"suggestedSchemes": ["Jal Jeevan Mission", "AMRUT"], "sdgMapping": ["SDG 6: Clean Water"], "confidence": 96}',
  rec: '{"title": "Ward 7 Overhead Reservoir Installation", "budget": 1800000, "timeline": "3-5 months", "confidence": 91}',
  report: '{"summary": "Critical water supply failure affecting 1,250 residents. Recommend immediate Jal Jeevan Mission application with priority score 87/100.", "confidence": 93}',
};

export const AIWorkflow: React.FC = () => {
  const { simulateNewSubmission } = useDB();
  const [steps, setSteps] = useState<AgentStep[]>(
    initialSteps.map(s => ({ ...s, status: 'idle' as const }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const resetPipeline = () => {
    setSteps(initialSteps.map(s => ({ ...s, status: 'idle' as const })));
    setTotalTime(0);
  };

  const runPipeline = async () => {
    resetPipeline();
    setIsRunning(true);
    const startTime = Date.now();
    let accumulated = 0;

    for (let i = 0; i < initialSteps.length; i++) {
      setSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'running' } : s
      ));

      // Simulated agent execution time (300–900ms per agent)
      const execTime = 300 + Math.floor(Math.random() * 600);
      accumulated += execTime;
      await new Promise(r => setTimeout(r, execTime));

      const confidence = 85 + Math.floor(Math.random() * 14);
      setSteps(prev => prev.map((s, idx) =>
        idx === i
          ? {
              ...s,
              status: 'done',
              executionMs: execTime,
              confidence,
              output: SAMPLE_OUTPUTS[initialSteps[i].id]
            }
          : s
      ));
    }

    setTotalTime(Date.now() - startTime);
    setIsRunning(false);

    // Optionally push a demo complaint
    try { await simulateNewSubmission(); } catch (_) {}
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <Cpu className="w-7 h-7 text-brand-500" />
            AI Workflow Visualizer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Live visualization of the 10-stage multi-agent pipeline processing citizen submissions.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetPipeline}
            disabled={isRunning}
            className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 glass-panel border border-white/5 rounded-xl transition-all disabled:opacity-40"
          >
            Reset
          </button>
          <button
            onClick={runPipeline}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-600/20 transition-all disabled:opacity-60"
          >
            {isRunning
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Pipeline...</>
              : <><Cpu className="w-4 h-4" /> Simulate Complaint</>
            }
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      {totalTime > 0 && (
        <GlassCard className="border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-6 py-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-400">Pipeline Complete!</p>
            <p className="text-xs text-slate-400">All 10 agents executed successfully in {(totalTime / 1000).toFixed(2)}s</p>
          </div>
          <div className="flex gap-6 ml-auto text-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Avg Confidence</p>
              <p className="text-xl font-black text-emerald-400">
                {Math.round(steps.filter(s => s.confidence).reduce((a, s) => a + (s.confidence || 0), 0) / steps.filter(s => s.confidence).length)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Total Time</p>
              <p className="text-xl font-black text-brand-400">{(totalTime / 1000).toFixed(1)}s</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Pipeline Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative">
            <GlassCard
              className={`border transition-all duration-500 ${
                step.status === 'done'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : step.status === 'running'
                  ? 'border-brand-500/60 bg-brand-500/5 shadow-lg shadow-brand-500/10'
                  : 'border-white/5'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step number & icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  step.status === 'done'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : step.status === 'running'
                    ? 'bg-brand-500/20 text-brand-400 animate-pulse'
                    : 'bg-slate-800/60 text-slate-500'
                }`}>
                  {step.status === 'running'
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : step.status === 'done'
                    ? <CheckCircle2 className="w-5 h-5" />
                    : step.icon
                  }
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-bold ${
                      step.status === 'done' ? 'text-emerald-300' :
                      step.status === 'running' ? 'text-brand-300' : 'text-slate-400'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-600 mr-1.5">#{idx + 1}</span>
                      {step.name}
                    </h4>
                    {step.status === 'done' && (
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{step.executionMs}ms
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">{step.confidence}% conf</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">{step.description}</p>

                  {step.status === 'running' && (
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden mt-2 border border-white/5">
                      <div className="h-full bg-brand-500 animate-pulse rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  )}

                  {step.status === 'done' && step.output && (
                    <div className="mt-2 bg-slate-950/60 border border-emerald-500/10 rounded-lg p-2.5 overflow-hidden">
                      <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Agent Output (JSON)</p>
                      <p className="text-[10px] text-emerald-300 font-mono leading-relaxed break-all line-clamp-2">
                        {step.output}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Connector arrow */}
            {idx < steps.length - 1 && idx % 2 === 0 && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex">
                <ArrowRight className={`w-4 h-4 ${step.status === 'done' ? 'text-emerald-500' : 'text-slate-700'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Architecture Info */}
      <GlassCard className="border border-white/5">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-500" /> Pipeline Architecture
        </h3>
        <div className="grid grid-cols-3 gap-4 text-xs text-slate-500">
          <div className="space-y-1">
            <p className="font-bold text-slate-400 uppercase tracking-wider">AI Engine</p>
            <p>Google Gemini 2.5 Flash</p>
            <p>Gemini Text Embedding 004</p>
            <p>Multimodal (text+image+audio)</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-400 uppercase tracking-wider">RAG Knowledge</p>
            <p>MPLADS Guidelines</p>
            <p>Jal Jeevan Mission</p>
            <p>PMGSY, Swachh Bharat, NHM</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-400 uppercase tracking-wider">Local Fallback</p>
            <p>TF-IDF keyword similarity</p>
            <p>Rule-based category mapping</p>
            <p>Formula priority scoring</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
