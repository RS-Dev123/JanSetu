import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { Send, Cpu, User, Sparkles, ChevronRight, Download, Mic, Volume2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'Top 5 Issues', prompt: 'What are the top 5 most urgent citizen issues in my constituency right now?' },
  { label: 'Water Problems', prompt: 'Which villages have the worst water supply issues? Suggest remediation projects.' },
  { label: 'Road Analysis', prompt: 'Analyze road condition complaints and recommend priority repairs under PMGSY.' },
  { label: 'MPLADS Budget', prompt: 'How should I allocate MPLADS funds this quarter based on citizen demand?' },
  { label: 'Generate Speech', prompt: 'Draft a speech for my next constituency visit based on citizen grievance themes.' },
  { label: 'Monthly Report', prompt: 'Prepare a summary report for this month\'s constituency development review meeting.' },
];

export const AICopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Namaste! I am your AI Constituency Development Assistant. I can help analyze citizen issues, recommend development projects, explain government schemes, and generate constituency reports.",
      citations: [],
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingStep, setTypingStep] = useState('');
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history from SQLite/Firestore on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const hist = await api.chat.getHistory();
        if (hist && hist.length > 0) {
          const mapped = hist.map((h: any, idx: number) => ({
            id: String(idx + 1),
            role: h.role,
            content: h.content,
            citations: h.citations || [],
            timestamp: h.timestamp || new Date().toISOString()
          }));
          setMessages(prev => [...prev, ...mapped]);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typingStatuses = [
    "Searching complaints database...",
    "Querying RAG knowledge base...",
    "Matching government scheme criteria...",
    "Extrapolating predictive trends...",
    "Compiling final Gemini response..."
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let statusIdx = 0;
    setTypingStep(typingStatuses[0]);
    const interval = setInterval(() => {
      statusIdx = (statusIdx + 1) % typingStatuses.length;
      setTypingStep(typingStatuses[statusIdx]);
    }, 1200);

    try {
      const data = await api.chat.send(text, messages);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I've analyzed your request.",
        citations: data.citations || [],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Please ensure the backend server is running on port 5000 for dynamic local RAG generation.",
        citations: ['Fallback Guide'],
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setTypingStep('');
    }
  };

  // Speak assistant response via WebSpeech synthesis
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`\-]/g, '');
      const utterance = new SynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Voice synthesis is not supported on this browser.');
    }
  };

  // Browser speech recognition (STT) implementation
  const handleListenInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-IN';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (e: any) => {
      const trans = e.results[0][0].transcript;
      if (trans) {
        setInput(prev => prev ? prev + ' ' + trans : trans);
      }
    };

    rec.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
  };

  const handlePrintDraft = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>JanSetu Draft Export</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h3 { color: #1e3a8a; border-bottom: 2.5px solid #ff9933; padding-bottom: 8px; }
            pre { font-family: inherit; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h3>🏛️ JanSetu Executive Draft Export</h3>
          <p style="font-size: 11px; color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
          <hr/>
          <pre>${content.replace(/###/g, '')}</pre>
          <script>window.onload = () => window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const budgetChartData = [
    { name: 'Roads', value: 35 },
    { name: 'Water', value: 30 },
    { name: 'Sanitation', value: 15 },
    { name: 'Power', value: 10 },
    { name: 'Municipal', value: 10 },
  ];

  // Helper cast for webpack SpeechSynthesisUtterance wrapper
  const SynthesisUtterance = (window as any).SpeechSynthesisUtterance || SpeechSynthesisUtterance;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 relative">
      {/* Saffron Top Accent Line */}
      <div className="saffron-accent-line w-full h-[2px] shrink-0" />

      {/* Header Banner */}
      <div className="px-8 pt-8 pb-4 shrink-0 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <Cpu className="w-7 h-7 text-brand-500" />
            JanSetu AI Assistant
          </h2>
          
          {/* Real-time active indicators */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold w-fit mt-2 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini AI Active</span>
            <span className="text-slate-700 px-1">|</span>
            <span className="text-[10px] text-slate-400">Knowledge Sources: ✓ Feedback • ✓ Schemes • ✓ Census • ✓ Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts Grid */}
      <div className="px-8 pb-4 shrink-0">
        <div className="flex gap-2 flex-wrap max-h-16 overflow-y-auto">
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              onClick={() => sendMessage(qp.prompt)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 glass-panel border border-brand-500/20 text-brand-400 hover:border-brand-500/50 hover:text-brand-300 rounded-full transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 animate-pulse" />
              {qp.label}
              <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto px-8 space-y-6 pb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-tr from-brand-600 to-cyan-500'
                : 'bg-slate-700'
            }`}>
              {msg.role === 'assistant'
                ? <Cpu className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-slate-300" />
              }
            </div>

            <div className={`max-w-2xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'glass-panel border border-white/5 text-slate-200'
                  : 'bg-brand-600/80 text-white border border-brand-500/30'
              }`}>
                {msg.content}

                {/* Inline budget distribution chart visualization */}
                {msg.role === 'assistant' && msg.content.includes('Sector') && (
                  <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-white/5 h-44 w-72">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Budget Distribution %</p>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={budgetChartData}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2a99ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Speech read-out & print actions */}
                {msg.role === 'assistant' && (
                  <div className="flex gap-3 pt-3 border-t border-slate-900/60 mt-3">
                    <button
                      onClick={() => handleSpeakText(msg.content)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 rounded text-xs font-bold flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen Response
                    </button>
                    {(msg.content.includes('Suggested') || msg.content.includes('Report') || msg.content.includes('Namaste')) && (
                      <button
                        onClick={() => handlePrintDraft(msg.content)}
                        className="px-2.5 py-1 bg-brand-500 hover:bg-brand-400 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Download className="w-3.5 h-3.5" /> Export PDF Draft
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {msg.citations.map((c, i) => (
                    <span key={i} className="text-[9px] font-bold text-brand-400 px-2 py-0.5 bg-brand-500/10 rounded border border-brand-500/20">
                      📄 {c}
                    </span>
                  ))}
                </div>
              )}

              <span className="text-[9px] text-slate-600 px-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Dynamic Stepper typing indicator */}
        {loading && (
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr from-brand-600 to-cyan-500">
              <Cpu className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="glass-panel border border-white/5 px-5 py-4 rounded-2xl flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold animate-pulse">{typingStep}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-8 pb-8 pt-4 shrink-0">
        <GlassCard className="border border-white/5 py-3 px-4">
          <div className="flex gap-3 items-end">
            {/* Native Voice Recognition microphone key */}
            <button
              onClick={handleListenInput}
              title="Mic Input"
              className={`p-3 rounded-xl transition-all border shrink-0 ${
                isListening
                  ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-400'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={isListening ? "Listening... speak now." : "Ask about citizen issues, schemes, budgets, or request a report draft..."}
                rows={2}
                className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/20 transition-all disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-slate-600 mt-2">Enter to send • Click microphone icon to activate voice input (STT) • Powered by Gemini 2.5</p>
        </GlassCard>
      </div>
    </div>
  );
};
export default AICopilot;
