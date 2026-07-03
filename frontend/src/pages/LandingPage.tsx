import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { 
  ArrowRight, Sparkles, 
  GraduationCap, HeartPulse, Sprout, Droplet, Zap, 
  Heart, Leaf, Building2, Eye, UserCheck, Star
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePortalEntry = (role: 'citizen' | 'government') => {
    if (role === 'citizen') {
      navigate('/citizen/login');
    } else {
      navigate('/government/login');
    }
  };

  const sectors = [
    { name: 'Roads & Transport', desc: 'Connectivity & PMGSY grid matches', icon: <Building2 className="w-5 h-5 text-amber-500" /> },
    { name: 'Water & Sanitation', desc: 'Jal Jeevan pipelines & Swachh Bharat', icon: <Droplet className="w-5 h-5 text-blue-400" /> },
    { name: 'Education & Schools', desc: 'Samagra Shiksha classrooms & toilets', icon: <GraduationCap className="w-5 h-5 text-indigo-400" /> },
    { name: 'Healthcare Grid', desc: 'National Health Mission pharmacies', icon: <HeartPulse className="w-5 h-5 text-rose-500" /> },
    { name: 'Electricity & Power', desc: 'Saubhagya solar grid linkages', icon: <Zap className="w-5 h-5 text-yellow-400" /> },
    { name: 'Agriculture & Irrigation', desc: 'Canal dredging & rural borewells', icon: <Sprout className="w-5 h-5 text-emerald-400" /> },
    { name: 'Women Empowerment', desc: 'Safe sanitation blocks & lighting', icon: <Heart className="w-5 h-5 text-purple-400" /> },
    { name: 'Eco Infrastructure', desc: 'Waste segregation & rainwater drains', icon: <Leaf className="w-5 h-5 text-teal-400" /> },
  ];

  const steps = [
    { id: '01', title: 'Multimodal Submission', desc: 'Citizens report issues in regional languages via audio, photos, or GPS.' },
    { id: '02', title: 'Generative AI Pipeline', desc: 'Gemini translates, OCR scans, scores priority, and filters duplicate tasks.' },
    { id: '03', title: 'Nodal Officer Action', desc: 'District officers verify, estimate SLAs, and assign departments.' },
    { id: '04', title: 'MP Control Console', desc: 'MPs optimize MPLADS budget splits and approve project executions.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-y-auto scroll-smooth flex flex-col relative">
      {/* Saffron Top Accent Line */}
      <div className="saffron-accent-line w-full h-[3px] shrink-0" />

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 border-b border-white/5 py-4.5 px-8 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          {/* Animated Ashoka Chakra Rotating Wheel logo */}
          <div className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/10 rounded-xl">
            <svg className="w-6.5 h-6.5 text-brand-400 animate-spin-ashoka" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="2.5" />
              {[...Array(24)].map((_, i) => {
                const angle = (i * 360) / 24;
                return (
                  <line 
                    key={i} 
                    x1="12" y1="12" 
                    x2={12 + 9 * Math.cos((angle * Math.PI) / 180)} 
                    y2={12 + 9 * Math.sin((angle * Math.PI) / 180)} 
                  />
                );
              })}
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent leading-none">
              JanSetu
            </h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">
              National Constituency Development Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/transparency')} className="text-xs font-bold text-slate-400 hover:text-brand-400 transition-colors uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-4 h-4" /> Transparency Board
          </button>
          
          <button 
            onClick={() => handlePortalEntry('citizen')}
            className="text-xs font-extrabold px-4 py-2 border border-brand-500/30 text-brand-400 hover:border-brand-500/60 rounded-xl transition-all"
          >
            Citizen Portal
          </button>

          <button 
            onClick={() => handlePortalEntry('government')}
            className="text-xs font-extrabold px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/10 transition-all flex items-center gap-1.5"
          >
            Government Log-in
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-16 px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center shrink-0">
        
        {/* Glow Spheres */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl -top-40 left-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Text Area */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Digital India AI Initiative</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl">
            People's Priorities
          </h1>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-300">
            AI Powered Constituency Development Platform
          </h2>

          <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] w-48 rounded" />

          <p className="text-sm font-extrabold text-[#FF9933] tracking-widest uppercase">
            "Empowering Citizens. Enabling Better Governance."
          </p>

          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            JanSetu empowers local communities to submit grievances via voice transcriptions, image uploads, and geo-pinning. A multi-agent AI pipeline translates, deduplicates, assigns municipal departments, and suggests optimal budgets for constituency development.
          </p>

          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => handlePortalEntry('citizen')}
              className="px-6 py-3.5 bg-[#FF9933] hover:bg-[#e6801a] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-saffron-500/10 transition-all active:scale-[0.98]"
            >
              Citizen Grievance Submission
              <ArrowRight className="w-4 h-4 stroke-[3px]" />
            </button>
            <button 
              onClick={() => handlePortalEntry('government')}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-black border border-white/5 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Government Portal Access
            </button>
          </div>
        </div>

        {/* Abstract India Map Outline SVG Column */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none"></div>
          
          {/* Abstract India geometric line map with pulsing coordinates */}
          <svg className="w-full max-w-[360px] h-[360px] text-slate-800" viewBox="0 0 200 220" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            {/* Outline shape coordinates of India Map */}
            <path 
              d="M100 20 L110 32 L112 40 L108 45 L112 55 L125 58 L127 68 L142 66 L150 78 L165 78 L170 82 L178 72 L185 85 L175 95 L165 92 L150 102 L145 95 L135 105 L135 118 L128 115 L120 125 L124 135 L120 148 L112 152 L108 165 L102 180 L92 205 L88 200 L84 190 L85 178 L78 165 L76 150 L68 142 L65 130 L55 125 L45 128 L35 122 L22 110 L15 102 L22 92 L38 90 L48 85 L52 75 L62 70 L72 65 L74 58 L72 50 L75 42 L88 38 L95 32 Z" 
              stroke="url(#indiaGlow)" 
              strokeWidth="1.5"
              className="drop-shadow-[0_0_15px_rgba(42,153,255,0.4)]"
            />
            <defs>
              <linearGradient id="indiaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#138808" />
              </linearGradient>
            </defs>

            {/* Pulsing city markers (Delhi, Midnapore, Bangalore) */}
            <g className="cursor-pointer">
              {/* New Delhi pin */}
              <circle cx="85" cy="70" r="3.5" fill="#FF9933" />
              <circle cx="85" cy="70" r="7" stroke="#FF9933" strokeWidth="1" className="animate-ping" />
              {/* Midnapore pin */}
              <circle cx="130" cy="115" r="3.5" fill="#FFFFFF" />
              <circle cx="130" cy="115" r="7" stroke="#FFFFFF" strokeWidth="1" className="animate-ping" />
              {/* Bangalore pin */}
              <circle cx="95" cy="165" r="3.5" fill="#138808" />
              <circle cx="95" cy="165" r="7" stroke="#138808" strokeWidth="1" className="animate-ping" />
            </g>
          </svg>
        </div>
      </header>

      {/* Flagship Development Sectors */}
      <section className="py-16 px-8 max-w-6xl mx-auto space-y-8 shrink-0">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase text-[#FF9933] tracking-widest">Welfare Sectors</h2>
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-100">National Development Scope</h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">JanSetu matches municipal issues to central government directives and schemes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sectors.map((s, idx) => (
            <GlassCard key={idx} className="border border-white/5 p-5 space-y-3.5 hover:border-[#FF9933]/30 transition-all glow-card">
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 flex items-center justify-center border border-white/5 shadow-inner">
                {s.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{s.name}</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{s.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* AI Pipeline workflow */}
      <section className="py-16 px-8 max-w-6xl mx-auto space-y-10 shrink-0 border-t border-white/5">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase text-brand-400 tracking-widest">Multi-Agent Processing</h2>
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-100">Orchestrator Workflow</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((st) => (
            <GlassCard key={st.id} className="border border-white/5 p-5 space-y-3 bg-slate-900/30 hover:border-brand-500/30 transition-all relative overflow-hidden">
              <span className="absolute -top-1 right-2 text-3xl font-black text-slate-800/40 select-none font-mono">
                {st.id}
              </span>
              <h4 className="text-sm font-extrabold text-slate-200 pr-6">{st.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{st.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Credentials Helper and Demo links */}
      <section className="py-10 px-8 max-w-3xl mx-auto shrink-0 text-center">
        <GlassCard className="border border-brand-500/20 p-6 bg-brand-500/5 space-y-4">
          <h4 className="text-sm font-bold text-brand-400 flex items-center justify-center gap-1.5 uppercase">
            <UserCheck className="w-5 h-5" /> Quick Access Credentials
          </h4>
          <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
            <div>
              <p className="font-bold text-slate-200">Demo Citizen</p>
              <p className="text-[10px] mt-0.5 font-mono select-all">citizen.arjun@demo.jansetu.in</p>
              <p className="text-[10px] text-slate-600 font-mono">demo1234</p>
            </div>
            <div className="border-x border-slate-900">
              <p className="font-bold text-slate-200">District Officer</p>
              <p className="text-[10px] mt-0.5 font-mono select-all">officer.suresh@demo.jansetu.in</p>
              <p className="text-[10px] text-slate-600 font-mono">demo1234</p>
            </div>
            <div>
              <p className="font-bold text-slate-200">Representative (MP/Admin)</p>
              <p className="text-[10px] mt-0.5 font-mono select-all">admin@demo.jansetu.in</p>
              <p className="text-[10px] text-slate-600 font-mono">demo1234</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-900 flex justify-center gap-6">
            <button 
              onClick={() => handlePortalEntry('citizen')}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest flex items-center gap-1"
            >
              Launch Citizen Portal ➔
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('login_role_preference', 'government');
                navigate('/judge');
              }}
              className="text-xs font-bold text-[#FF9933] hover:text-[#e6801a] uppercase tracking-widest flex items-center gap-1"
            >
              <Star className="w-4 h-4 fill-current" /> Open Judge Panel ➔
            </button>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600 bg-slate-950/40 mt-auto shrink-0">
        <p>© 2026 JanSetu. National AI Hackathon Entry. Production Ready.</p>
        <p className="mt-1 flex justify-center items-center gap-1.5">
          <span>Powered by Google Gemini 2.5 Pro & Flash</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 font-bold uppercase text-[9px]">Gemini AI Active</span>
        </p>
      </footer>
    </div>
  );
};
export default LandingPage;
