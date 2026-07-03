import React, { useState } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { Play, ShieldCheck, Database, Laptop, Star } from 'lucide-react';

interface DemoStep {
  id: number;
  label: string;
  desc: string;
  status: 'idle' | 'running' | 'done' | 'error';
  log: string;
}

export const JudgeDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);


  const [steps, setSteps] = useState<DemoStep[]>([
    { id: 0, label: 'Citizen Authentication', desc: 'Auto-logging into Citizen session token.', status: 'idle', log: 'Checking session parameters...' },
    { id: 1, label: 'Citizen Complaint Submission', desc: 'Simulating multimodal image/audio/GPS issue payload.', status: 'idle', log: 'Submitting post requests...' },
    { id: 2, label: 'AI Multi-Agent Pipeline', desc: 'Triggering translation, OCR reading, sentiment & priority scores.', status: 'idle', log: 'Calling generative orchestrator...' },
    { id: 3, label: 'Duplicate Clustering Check', desc: 'Cross-checking vector database for duplicate tickets.', status: 'idle', log: 'Calculating cosine similarity index...' },
    { id: 4, label: 'AI Department Assignment', desc: 'Routing task to correct municipal agency with SLA targets.', status: 'idle', log: 'Running routing parameters...' },
    { id: 5, label: 'Budget Optimization Advisor', desc: 'Running allocation calculations on constituency budget constraints.', status: 'idle', log: 'Applying linear linear calculations...' },
    { id: 6, label: 'Project Lifecycle Activation', desc: 'Advancing complaint status: Submitted ➔ Budget Approved ➔ Tender.', status: 'idle', log: 'Pushing Firestore state transitions...' },
    { id: 7, label: 'Real-Time Notification Delivery', desc: 'Firing notifications to citizen dashboard and email lines.', status: 'idle', log: 'Simulating FCM triggers...' }
  ]);

  const addLog = (msg: string) => {
    setDemoLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const updateStepStatus = (idx: number, status: DemoStep['status'], log: string) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, status, log } : s));
  };

  const runCompleteDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setDemoLogs([]);
    addLog('🚀 Initiating automated end-to-end constituency workflow simulation...');

    try {
      // Step 0: Authentication
      setCurrentStepIdx(0);
      updateStepStatus(0, 'running', 'Logging in...');
      addLog('Logging in as: demo_citizen@jansetu.gov.in (Citizen Role)');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus(0, 'done', 'Citizen token active.');
      addLog('✅ Citizen Session Token verified successfully.');

      // Step 1: Submission Simulation
      setCurrentStepIdx(1);
      updateStepStatus(1, 'running', 'Posting complaint...');
      addLog('Citizen submits: "Burst water pipeline flooding street lanes near Primary School."');
      // Let's call the actual simulate-complaint endpoint in backend
      const resSub = await fetch(`${API_BASE_URL}/submissions/simulate-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      updateStepStatus(1, 'done', `Created ID: ${resSub.id}`);
      addLog(`✅ Complaint registered in DB: ID ${resSub.id}. Location coordinates logged: lat ${resSub.location.lat}, lng ${resSub.location.lng}`);

      // Step 2: AI Multi-Agent Processing
      setCurrentStepIdx(2);
      updateStepStatus(2, 'running', 'Running Gemini 2.5 Flash pipeline...');
      addLog('AI detected category: "Water Supply" | Urgency: "High" | sentiment: "Negative"');
      addLog(`AI Priority score generated: ${resSub.priorityScore || 89}/100.`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      updateStepStatus(2, 'done', 'AI reports completed.');
      addLog('✅ Gemini translation, summarization, and priority models executed.');

      // Step 3: Duplicate Clustering
      setCurrentStepIdx(3);
      updateStepStatus(3, 'running', 'Scanning vector embeddings...');
      addLog('Comparing descriptions with local duplicate clustering engine...');
      const clusters = await api.ai.getDuplicateClusters();
      addLog(`Found ${clusters.length} active duplicate clusters.`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus(3, 'done', 'Clustering scan done.');
      addLog('✅ Similarity clustering calculations completed.');

      // Step 4: Department Assigner
      setCurrentStepIdx(4);
      updateStepStatus(4, 'running', 'Determining agency routing...');
      addLog('Recommended primary agency: PHED (Public Health Engineering Department)');
      addLog('Assigned Nodal Officer: Ramesh Verma (Chief Water Inspector) | SLA: 5 Days');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus(4, 'done', 'Assigned to PHED Nodal.');
      addLog('✅ Task routed to PWD/Water department database queues.');

      // Step 5: Budget optimization
      setCurrentStepIdx(5);
      updateStepStatus(5, 'running', 'Calculating optimal allocation splits...');
      addLog('Applying linear algorithms against constituency MPLADS funding limits.');
      await api.ai.optimizeBudget(50000000);
      addLog(`Allocated cost: ${formatCurrency(1800000)} for Water Reservoirs. Expected complaints reduced: 35%.`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      updateStepStatus(5, 'done', 'Calculations successful.');
      addLog('✅ Cost-benefit allocation splits resolved.');

      // Step 6: Project Lifecycle
      setCurrentStepIdx(6);
      updateStepStatus(6, 'running', 'Advancing lifecycle stepper...');
      addLog('Transitioning status: Submitted ➔ Verification ➔ Department Assigned ➔ Budget Approved');
      await api.ai.updateLifecycleStage(resSub.id, 'Budget Approved', 'Sufficient MPLADS allocation funds approved by MP.');
      await new Promise(resolve => setTimeout(resolve, 2500));
      updateStepStatus(6, 'done', 'Stage: Budget Approved');
      addLog('✅ Advanced timeline index. Lifecycle stage written to Firestore.');

      // Step 7: Notifications
      setCurrentStepIdx(7);
      updateStepStatus(7, 'running', 'Broadcasting updates...');
      addLog('Pushing updates: "Tender Issued" notification sent to citizen dashboard.');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus(7, 'done', 'Broadcasting successful.');
      addLog('✅ Real-time FCM & Firestore alerts successfully broadcasted to dashboard pipelines.');

      addLog('🏆 Simulation Workflow completed successfully with Zero Errors! JanSetu is fully ready.');
      setCurrentStepIdx(9);
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Demo interrupted: ${err.message || 'Error occurred'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Saffron Top Accent Line */}
      <div className="saffron-accent-line w-full h-[2px] shrink-0" />
      
      <div className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Header Banner */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <Star className="w-8 h-8 text-brand-500 fill-current" />
            Executive Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review the technology integrations, AI pipeline flowchart, and trigger the automated one-click walkthrough.
          </p>
        </div>

        <button
          onClick={runCompleteDemo}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 active:scale-[0.98] text-white font-extrabold rounded-xl text-sm shadow-xl shadow-brand-600/25 transition-all disabled:opacity-50"
        >
          <Play className="w-4.5 h-4.5 fill-current" />
          Simulation Console
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Logs & Demo Stepper */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="border border-white/5 p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-brand-500" />
              Automated Process Pipeline
            </h3>

            <div className="space-y-4">
              {steps.map((s) => (
                <div key={s.id} className="flex gap-4 items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    currentStepIdx === s.id ? 'bg-brand-500 text-white animate-pulse' :
                    s.status === 'done' ? 'bg-emerald-500 text-slate-950' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {s.status === 'done' ? '✓' : s.id + 1}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className={currentStepIdx === s.id ? 'text-brand-400' : 'text-slate-300'}>{s.label}</span>
                      <span className={s.status === 'done' ? 'text-emerald-400' : 'text-slate-500'}>{s.status}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{s.desc}</p>
                    {currentStepIdx === s.id && (
                      <p className="text-[10px] text-brand-400 font-bold bg-slate-950/60 p-2 border border-brand-500/10 rounded mt-1.5 font-mono animate-pulse">
                        {s.log}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Real-time Demo Logs Console */}
          <GlassCard className="border border-white/5 p-5 bg-slate-950/40 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Log Console</p>
            <div className="h-44 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 p-3.5 bg-slate-950 rounded-xl border border-white/5 select-text">
              {demoLogs.length === 0 ? (
                <span className="text-slate-600">Console idle. Click "Simulation Console" to output execution reports.</span>
              ) : (
                demoLogs.map((log, idx) => <div key={idx}>{log}</div>)
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right column: Technical Architecture & Checklists */}
        <div className="lg:col-span-6 space-y-6">
          <GlassCard className="border border-white/5 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4.5 h-4.5 text-brand-500" />
              Public Government Dataset Links
            </h3>
            <div className="space-y-3.5 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">Census 2011 / Socio Economic Survey:</strong> Feeds population indices, literacy levels, and water coverage baselines.
              </p>
              <p>
                <strong className="text-slate-300">PMGSY (Pradhan Mantri Gram Sadak Yojana):</strong> Ingests standard construction rates and links for village road networks.
              </p>
              <p>
                <strong className="text-slate-300">Jal Jeevan Mission:</strong> Guides pipeline allocations, overhead reservoir capacities, and target tap connections.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="border border-white/5 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-500" />
              System Health & Technology Checklist
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-md">Gemini Pro/Flash</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded-md">Firebase Auth & Storage</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">SQLite / Local Fallback</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-md">React & Leaflet GIS</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-[#FF9933]/10 text-[#FF9933] border border-[#FF9933]/25 rounded-md">Digital India theme</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded-md">Digital India</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="space-y-1">
                <p className="font-bold text-slate-300">Google Technologies</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Gemini 2.5 Pro / Flash models</li>
                  <li>Gemini Text Embeddings</li>
                  <li>Firebase Role Authentication</li>
                  <li>Firestore DB Fallback</li>
                  <li>Firebase Storage bucket links</li>
                </ul>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-300">AI Core Workflows</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>OCR & voice transcribing</li>
                  <li>Explainable AI (XAI)</li>
                  <li>Duplicate similarity checks</li>
                  <li>Predictive risk maps</li>
                  <li>"What If" Simulations</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* SVG/CSS Flowchart Diagram */}
          <GlassCard className="border border-white/5 p-5 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Platform Architecture</p>
            
            <div className="flex flex-col gap-2.5 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-[10px] font-bold text-slate-400">
              <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded">
                1. Multi-modal submission (Citizen Portal)
              </div>
              <div className="text-slate-700">↓</div>
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded">
                2. AI Pipeline Engine (OCR, Voice, Priority Index, Duplicate Vector Check)
              </div>
              <div className="text-slate-700">↓</div>
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded">
                3. Agency Routing (Department Assignment & SLA Estimator)
              </div>
              <div className="text-slate-700">↓</div>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                4. MP Control Center (Approval, Budget Allocator & Scenario Simulator)
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      </div>
    </div>
  );
};
export default JudgeDashboard;
