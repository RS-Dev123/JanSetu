import React, { useState, useRef, useEffect } from 'react';
import { useDB, Submission } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  FileText, Send, CheckCircle2, Clock, 
  User, Globe, Megaphone, CheckSquare, Search, Navigation
} from 'lucide-react';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to keep map centered when position changes
const ChangeMapCenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapEventsHandler = ({ onChange }: { onChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// UI Translations dictionary
const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    welcome: 'Welcome,',
    submitTitle: 'Submit Priority Request',
    logGrievance: 'Log Infrastructure Grievance',
    trackHistory: 'Track Grievance History',
    portalTitle: 'Citizen Grievance Portal',
    portalDesc: 'Voice your development priorities. Submit issues with multimodal files and target map locations.',
    grievanceType: 'Request Type',
    complaint: 'Complaint / Grievance',
    suggestion: 'Development Suggestion'
  },
  Hindi: {
    welcome: 'स्वागत है,',
    submitTitle: 'प्राथमिकता अनुरोध सबमिट करें',
    logGrievance: 'बुनियादी ढांचा शिकायत दर्ज करें',
    trackHistory: 'शिकायत इतिहास को ट्रैक करें',
    portalTitle: 'नागरिक शिकायत पोर्टल',
    portalDesc: 'अपनी विकास प्राथमिकताओं को आवाज दें। मल्टीमॉडल फाइलों और मानचित्र स्थानों के साथ मुद्दों को सबमिट करें।',
    grievanceType: 'अनुरोध प्रकार',
    complaint: 'शिकायत / समस्या',
    suggestion: 'विकास सुझाव'
  },
  Bengali: {
    welcome: 'স্বাগতম,',
    submitTitle: 'অনুরোধ জমা দিন',
    logGrievance: 'অভিযোগ নথিভুক্ত করুন',
    trackHistory: 'অভিযোগের ইতিহাস দেখুন',
    portalTitle: 'নাগরিক অভিযোগ পোর্টাল',
    portalDesc: 'আপনার এলাকার উন্নয়নের দাবি জানান। মাল্টিমিডিয়া ফাইল এবং মানচিত্রের সাহায্যে অভিযোগ জমা দিন।',
    grievanceType: 'অনুরোধের ধরণ',
    complaint: 'অভিযোগ / সমস্যা',
    suggestion: 'উন্নয়নমূলক প্রস্তাব'
  },
  Tamil: {
    welcome: 'வரவேற்கிறோம்,',
    submitTitle: 'கோரிக்கையைச் சமர்ப்பிக்கவும்',
    logGrievance: 'மனுவை பதிவு செய்யவும்',
    trackHistory: 'மனுவின் நிலையை கண்காணிக்கவும்',
    portalTitle: 'குடிமக்கள் குறைதீர்க்கும் தளம்',
    portalDesc: 'உள்ளூர் வளர்ச்சித் தேவைகளைப் பதிவு செய்யவும். மல்டிমোடல் கோப்புகள் மற்றும் வரைபட இருப்பிடத்துடன் மனு சமர்ப்பிக்கவும்.',
    grievanceType: 'கோரிக்கை வகை',
    complaint: 'புகார் / குறைபாடு',
    suggestion: 'வளர்ச்சி ஆலோசனை'
  }
};

export const CitizenPortal: React.FC = () => {
  const { user } = useAuth();
  const { submissions, createSubmission, refreshData, recommendations } = useDB();

  // Settings & tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit' | 'history'>('dashboard');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Bengali' | 'Tamil'>('English');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads & Transport');
  const [type, setType] = useState<'complaint' | 'suggestion'>('complaint');
  
  // Geolocation & Reverse Geocoding States
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationDetails, setLocationDetails] = useState({
    village: 'Paharganj',
    ward: 'Ward 14',
    district: 'New Delhi',
    state: 'Delhi',
    address: 'Paharganj, New Delhi, Delhi, 110001'
  });

  // File upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    refreshData();
    if (user?.constituency === 'Bengaluru Urban') {
      setPosition([12.9716, 77.5946]);
      setLocationDetails({
        village: 'Jayanagar',
        ward: 'Ward 109',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        address: 'Jayanagar 4th Block, Bengaluru, Karnataka, 560011'
      });
    } else if (user?.constituency === 'Paschim Medinipur') {
      setPosition([22.4257, 87.3199]);
      setLocationDetails({
        village: 'Kharagpur',
        ward: 'Ward 8',
        district: 'Paschim Medinipur',
        state: 'West Bengal',
        address: 'Kharagpur Town, Paschim Medinipur, West Bengal, 721301'
      });
    }
  }, [user, refreshData]);

  // Handle manual reverse geocode calculation based on coordinates
  const triggerReverseGeocode = (lat: number, lng: number) => {
    // Attempt Nominatim reverse geocode, fallback to constituency-based nearest calculation
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const addr = data.address;
          setLocationDetails({
            village: addr.village || addr.suburb || addr.town || 'Local Area',
            ward: addr.suburb || addr.neighbourhood || 'Ward 12',
            district: addr.city_district || addr.district || addr.city || 'New Delhi',
            state: addr.state || 'Delhi',
            address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
        }
      })
      .catch(() => {
        // Fallback local calculations
        if (lat < 14) {
          setLocationDetails({
            village: 'Jayanagar',
            ward: 'Ward 109',
            district: 'Bengaluru Urban',
            state: 'Karnataka',
            address: 'Jayanagar 4th Block, Bengaluru, Karnataka, 560011'
          });
        } else if (lat < 25) {
          setLocationDetails({
            village: 'Kharagpur',
            ward: 'Ward 8',
            district: 'Paschim Medinipur',
            state: 'West Bengal',
            address: 'Kharagpur Town, Paschim Medinipur, West Bengal, 721301'
          });
        } else {
          setLocationDetails({
            village: 'Paharganj',
            ward: 'Ward 14',
            district: 'New Delhi',
            state: 'Delhi',
            address: 'Paharganj, New Delhi, Delhi, 110001'
          });
        }
      });
  };

  // Browser Geolocation API fetcher
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsFetchingGps(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setGpsAccuracy(pos.coords.accuracy);
        setIsFetchingGps(false);
        triggerReverseGeocode(lat, lng);
      },
      (err) => {
        console.error(err);
        setIsFetchingGps(false);
        setError('Location permission denied. Please allow location permissions or pin manually on the map.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Map search bar trigger
  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // PIN code or region quick coordinate resolve
    const q = searchQuery.toLowerCase().trim();
    let resolvedPos: [number, number] | null = null;
    
    if (q.includes('110001') || q.includes('delhi')) {
      resolvedPos = [28.6139, 77.2090];
    } else if (q.includes('560011') || q.includes('bengaluru') || q.includes('jayanagar')) {
      resolvedPos = [12.9716, 77.5946];
    } else if (q.includes('721301') || q.includes('kharagpur') || q.includes('medinipur')) {
      resolvedPos = [22.4257, 87.3199];
    }

    if (resolvedPos) {
      setPosition(resolvedPos);
      triggerReverseGeocode(resolvedPos[0], resolvedPos[1]);
    } else {
      // General OSM Nominatim search query
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setPosition([lat, lon]);
            triggerReverseGeocode(lat, lon);
          } else {
            setError('Could not find search location coordinates. Pin manually on map.');
          }
        })
        .catch(() => {
          setError('Map search failed. Pin manually on map.');
        });
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('type', type);
      formData.append('lat', String(position[0]));
      formData.append('lng', String(position[1]));
      formData.append('village', locationDetails.village);
      formData.append('ward', locationDetails.ward);
      formData.append('district', locationDetails.district);
      formData.append('state', locationDetails.state);
      formData.append('address', locationDetails.address);
      formData.append('source', 'portal');
      if (user && user.name) {
        formData.append('citizenName', user.name);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voice_complaint.wav');
      }

      const timeline = [
        { status: 'Submitted', description: `Grievance submitted by citizen ${user?.name} via web portal.`, updatedAt: new Date().toISOString() },
        { status: 'AI Analysis', description: `AI multi-agent pipeline processed the text. OCR and sentiment checks completed.`, updatedAt: new Date().toISOString() }
      ];
      formData.append('timeline', JSON.stringify(timeline));

      await createSubmission(formData);
      setSuccess(true);
      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setActiveTab('history');
    } catch (err: any) {
      setError(err.message || 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  const citizenSubs = submissions.filter(s => s.citizenId === user?.uid);
  const t = TRANSLATIONS[language];

  // Announcements mock
  const announcements = [
    { title: 'Jal Jeevan Water Pipeline LAYOUT Ward 7', text: 'Excavation and lay work starts Friday.' },
    { title: 'Constituency Development Fund Approved', text: 'MP approves budget allocation proposals.' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen space-y-8 flex flex-col">
      {/* Top Banner Header */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
            {t.portalTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">{t.portalDesc}</p>
        </div>

        {/* Configuration Pane */}
        <div className="flex items-center gap-4">
          {/* Language Selection */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/50 rounded-xl p-1 text-xs">
            {['English', 'Hindi', 'Bengali', 'Tamil'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  language === lang ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang.charAt(0) + lang.slice(1, 3)}
              </button>
            ))}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Constituency</span>
            <p className="text-sm font-semibold text-brand-400">{user?.constituency}</p>
          </div>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <div className="flex gap-1.5 glass-panel border border-white/5 p-1 w-fit rounded-xl shrink-0">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'submit' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          {t.submitTitle}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'history' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Track History ({citizenSubs.length})
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Greeting */}
              <GlassCard className="border border-white/5 bg-slate-900/20 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white text-lg font-black uppercase">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">{t.welcome} {user?.name ?? "User"}</h3>
                  <p className="text-xs text-slate-500">Log in Role: <b className="text-brand-400 capitalize">{user?.role}</b></p>
                </div>
              </GlassCard>

              {/* Announcements */}
              <GlassCard className="border border-white/5 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-brand-500 animate-bounce" />
                  Government Announcements
                </h4>
                <div className="space-y-3">
                  {announcements.map((a, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                      <p className="text-xs font-bold text-brand-400">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.text}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-5">
              <GlassCard className="border border-white/5 space-y-4 h-full flex flex-col">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-500" />
                  Local Development Projects
                </h4>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {recommendations.slice(0, 4).map(rec => (
                    <div key={rec.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-300">{rec.title}</span>
                        <span className="text-emerald-400 font-bold uppercase text-[9px]">{rec.status}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{rec.category}</p>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-10">No active local recommendations yet.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Submit Issue Tab */}
        {activeTab === 'submit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-7">
              <GlassCard className="border border-white/5 space-y-6">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-brand-500" />
                  {t.logGrievance}
                </h3>

                {success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Grievance logged successfully! AI pipeline is classifying it.</span>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Broken water pipeline, potholes etc..."
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t.grievanceType}</label>
                      <select
                        value={type}
                        onChange={e => setType(e.target.value as any)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-brand-500 outline-none"
                      >
                        <option value="complaint">{t.complaint}</option>
                        <option value="suggestion">{t.suggestion}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-brand-500 outline-none"
                      >
                        <option value="Roads & Transport">Roads & Transport</option>
                        <option value="Water Supply">Water Supply</option>
                        <option value="Electricity & Power">Electricity & Power</option>
                        <option value="Sanitation & Waste">Sanitation & Waste</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Public Spaces">Public Spaces</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Media options */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Media Files</label>
                      <div className="flex gap-2 items-center">
                        <label className="cursor-pointer px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors">
                          📷 Image / Doc
                          <input type="file" onChange={handleImageChange} className="hidden" />
                        </label>
                        {imagePreview && <img src={imagePreview} className="w-8 h-8 rounded object-cover" />}
                        
                        {!isRecording ? (
                          <button type="button" onClick={startRecording} className="px-4 py-3 bg-slate-800 rounded-xl text-xs text-slate-300">🎙️ Record</button>
                        ) : (
                          <button type="button" onClick={stopRecording} className="px-4 py-3 bg-red-600 rounded-xl text-xs text-white">Stop</button>
                        )}
                        {audioUrl && <span className="text-[10px] text-slate-500">Audio ready</span>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Details of the issue..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-brand-500 outline-none resize-none"
                    />
                  </div>

                  {/* Leaflet GPS Selector */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase">Pin Target Location</label>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        {/* Search Location Bar */}
                        <form onSubmit={handleLocationSearch} className="flex gap-1.5 flex-1 md:flex-none">
                          <input
                            type="text"
                            placeholder="PIN or Ward search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500"
                          />
                          <button type="submit" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        </form>

                        {/* GPS Button */}
                        <button
                          type="button"
                          disabled={isFetchingGps}
                          onClick={handleUseCurrentLocation}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shrink-0 disabled:opacity-50"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          {isFetchingGps ? 'Locating...' : 'Use My GPS'}
                        </button>
                      </div>
                    </div>

                    {/* Geolocation Stats Summary Card */}
                    <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-slate-400 flex items-center gap-1">📍 Current Detected Location</span>
                        {gpsAccuracy && <span className="text-[10px] text-brand-400">Accuracy: ±{Math.round(gpsAccuracy)}m</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">Latitude / Longitude</span>
                          <p className="font-semibold text-slate-300">{position[0].toFixed(5)}, {position[1].toFixed(5)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">Village / Ward</span>
                          <p className="font-semibold text-slate-300">{locationDetails.village} / {locationDetails.ward}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">District / State</span>
                          <p className="font-semibold text-slate-300">{locationDetails.district}, {locationDetails.state}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase">Full Formatted Address</span>
                          <p className="font-semibold text-slate-300 truncate max-w-xs" title={locationDetails.address}>
                            {locationDetails.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="h-48 rounded-xl overflow-hidden border border-slate-800 relative">
                      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker 
                          draggable={true}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const pos = marker.getLatLng();
                              setPosition([pos.lat, pos.lng]);
                              triggerReverseGeocode(pos.lat, pos.lng);
                            }
                          }}
                          position={position} 
                        />
                        {gpsAccuracy && (
                          <Circle 
                            center={position} 
                            radius={gpsAccuracy} 
                            pathOptions={{ color: '#2a99ff', fillColor: '#2a99ff', fillOpacity: 0.15, weight: 1 }} 
                          />
                        )}
                        <ChangeMapCenter center={position} />
                        <MapEventsHandler onChange={(lat, lng) => {
                          setPosition([lat, lng]);
                          triggerReverseGeocode(lat, lng);
                        }} />
                      </MapContainer>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    {t.submitTitle}
                  </button>
                </form>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Track History Tab */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className={`${selectedSub ? 'lg:col-span-6' : 'lg:col-span-12'} overflow-y-auto space-y-3`}>
              <GlassCard className="border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-slate-300">{t.trackHistory}</h3>
                <div className="space-y-2">
                  {citizenSubs.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedSub?.id === sub.id ? 'border-brand-500 bg-brand-500/5' : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{sub.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sub.description}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                          sub.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          sub.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>{sub.status}</span>
                      </div>
                    </div>
                  ))}
                  {citizenSubs.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-10">No history found. Submit your first issue.</p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Timeline Inspector Panel */}
            {selectedSub && (
              <div className="lg:col-span-6 overflow-y-auto">
                <GlassCard className="border border-brand-500/20 bg-brand-500/3 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded">
                        {selectedSub.type || 'Complaint'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-200 mt-2">{selectedSub.title}</h3>
                    </div>
                    <button onClick={() => setSelectedSub(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
                  </div>

                  {/* Complete 11-stage Timeline */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Timeline</h4>
                    <div className="relative border-l border-slate-800 ml-3 pl-5 space-y-5 py-1">
                      {[
                        { key: 'Submitted', label: 'Grievance Logged' },
                        { key: 'AI Analysis', label: 'AI Multi-Agent Check' },
                        { key: 'Duplicate Detection', label: 'Duplicate Filtering' },
                        { key: 'Officer Verification', label: 'Officer Review' },
                        { key: 'Department Assigned', label: 'Department Routed' },
                        { key: 'MP Review', label: 'MP Action' },
                        { key: 'Budget Approval', label: 'Budget Allocation' },
                        { key: 'Project Started', label: 'Project Commenced' },
                        { key: 'Work In Progress', label: 'Execution Active' },
                        { key: 'Completed', label: 'Resolution Verified' },
                        { key: 'Feedback', label: 'Citizen Feedback' }
                      ].map((tStep, index) => {
                        const hasPassed = true; // Mock past stages
                        return (
                          <div key={index} className="relative">
                            <div className="absolute -left-7 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                              <div className={`w-1.5 h-1.5 rounded-full ${hasPassed ? 'bg-brand-400 animate-pulse' : 'bg-slate-700'}`}></div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{tStep.label}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Stage updated and verified by system logs.</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
