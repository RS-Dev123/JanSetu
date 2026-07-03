import React, { useState, useEffect } from 'react';
import { useDB, Submission } from '../context/DBContext';
import { GlassCard } from '../components/GlassCard';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { 
  Map as MapIcon, Filter, Target, Search, Calendar, ShieldAlert, Download, Sun 
} from 'lucide-react';

const urgencyColor: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const urgencyRadius: Record<string, number> = {
  low: 6, medium: 10, high: 14, critical: 18,
};

// Component that draws mock administrative boundaries (constituency boundaries)
const BoundaryOverlay: React.FC = () => {
  // New Delhi district mock boundaries
  const newDelhiPolygon: [number, number][] = [
    [28.63, 77.18],
    [28.65, 77.20],
    [28.63, 77.24],
    [28.58, 77.25],
    [28.57, 77.20],
    [28.59, 77.17]
  ];

  // Bengaluru district mock boundaries
  const blrPolygon: [number, number][] = [
    [12.94, 77.56],
    [12.98, 77.55],
    [13.01, 77.58],
    [13.00, 77.62],
    [12.96, 77.64],
    [12.93, 77.60]
  ];

  return (
    <>
      <Polygon 
        positions={newDelhiPolygon} 
        pathOptions={{ color: '#2a99ff', fillColor: '#2a99ff', fillOpacity: 0.05, weight: 1.5, dashArray: '4 4' }} 
      />
      <Polygon 
        positions={blrPolygon} 
        pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.05, weight: 1.5, dashArray: '4 4' }} 
      />
    </>
  );
};

export const MapDashboard: React.FC = () => {
  const { submissions, refreshData } = useDB();
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState(90); // 90 days default
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Drawing state mock for polygon analysis
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnBox, setDrawnBox] = useState<boolean>(false);

  // Layer toggling and integrated indicators states
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'topo'>('dark');
  const [govData, setGovData] = useState<any>(null);

  useEffect(() => { refreshData(); }, [refreshData]);

  // Fetch government database indicators when a pin is selected
  useEffect(() => {
    const loadGovDetails = async () => {
      if (!selectedSub) {
        setGovData(null);
        return;
      }
      try {
        const data = await api.ai.getGovData({
          district: selectedSub.location?.district,
          lat: selectedSub.location?.lat,
          lng: selectedSub.location?.lng
        });
        setGovData(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadGovDetails();
  }, [selectedSub]);

  // GeoJSON data exporter helper
  const exportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map(s => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [s.location.lng, s.location.lat]
        },
        properties: {
          id: s.id,
          title: s.title,
          category: s.category,
          urgency: s.urgency,
          priorityScore: s.priorityScore,
          district: s.location.district,
          state: s.location.state,
          village: s.location.village
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jansetu_${selectedSub?.location?.district || 'constituency'}_gis.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filters application
  const filtered = submissions.filter(s => {
    if (filterCategory !== 'All' && s.category !== filterCategory) return false;
    if (filterUrgency !== 'All' && s.urgency !== filterUrgency) return false;
    if (filterType !== 'All' && s.type !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = (s.title + ' ' + s.description + ' ' + (s.location?.village || '') + ' ' + (s.location?.ward || '')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    const daysDiff = (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > timeRange) return false;
    return true;
  });

  const stats = {
    total: filtered.length,
    critical: filtered.filter(s => s.urgency === 'critical').length,
    complaints: filtered.filter(s => s.type === 'complaint').length,
    suggestions: filtered.filter(s => s.type === 'suggestion').length,
    districts: new Set(filtered.map(s => s.location?.district || 'Unknown')).size,
  };

  const center: [number, number] = [20.5937, 78.9629];

  const handlePolygonAnalysis = () => {
    setIsDrawing(!isDrawing);
    if (!isDrawing) {
      setDrawnBox(true);
    } else {
      setDrawnBox(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Top Banner Header */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
              <MapIcon className="w-7 h-7 text-brand-500" />
              Smart GIS Hotspot Center
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Geospatial cluster verification and boundary analysis. Click hotspots for administrative details.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center glass-panel px-4 py-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Active Wards</p>
              <p className="text-lg font-black text-brand-400">{stats.total}</p>
            </div>
            <div className="text-center glass-panel px-4 py-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Suggestions</p>
              <p className="text-lg font-black text-cyan-400">{stats.suggestions}</p>
            </div>
            <div className="text-center glass-panel px-4 py-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Critical</p>
              <p className="text-lg font-black text-red-400">{stats.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="px-8 pb-4 shrink-0">
        <GlassCard className="border border-white/5 py-3 px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-bold uppercase tracking-wider">GIS Filters</span>
            </div>

            {/* Category selection */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Roads & Transport">Roads & Transport</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity & Power">Electricity & Power</option>
              <option value="Sanitation & Waste">Sanitation & Waste</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Public Spaces">Public Spaces</option>
            </select>

            {/* Type selection */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
            >
              <option value="All">All Types</option>
              <option value="complaint">Complaints Only</option>
              <option value="suggestion">Suggestions Only</option>
            </select>

            {/* Urgency selection */}
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="text-xs bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 outline-none"
            >
              <option value="All">All Urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search village / ward..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/50 rounded-lg text-xs text-slate-300 outline-none w-44"
              />
            </div>

            {/* Time slider */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>Range:</span>
              <input 
                type="range" 
                min="7" 
                max="90" 
                value={timeRange} 
                onChange={e => setTimeRange(Number(e.target.value))} 
                className="w-20"
              />
              <span className="font-bold text-slate-300">{timeRange}d</span>
            </div>

            {/* Drawing tool trigger */}
            <button
              onClick={handlePolygonAnalysis}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                isDrawing ? 'bg-indigo-600 border-indigo-500 text-white' : 'glass-panel border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isDrawing ? 'Cancel drawing' : 'Polygon Analysis'}
            </button>

            {/* GIS Layer Select */}
            <select
              value={mapLayer}
              onChange={e => setMapLayer(e.target.value as any)}
              className="text-xs bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 outline-none cursor-pointer"
            >
              <option value="dark">Carto Dark Layer</option>
              <option value="satellite">ESRI Satellite Layer</option>
              <option value="topo">OpenTopo Terrain Layer</option>
            </select>

            {/* GeoJSON Export */}
            <button
              onClick={exportGeoJSON}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 glass-panel text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> GeoJSON Export
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Map Layout split */}
      <div className="flex-1 px-8 pb-8 flex gap-6 overflow-hidden min-h-0">
        {/* Leaflet Map Box */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800/60 shadow-2xl relative">
          <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            {mapLayer === 'satellite' ? (
              <TileLayer
                attribution='&copy; ESRI Satellite'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : mapLayer === 'topo' ? (
              <TileLayer
                attribution='&copy; OpenTopoMap'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution='&copy; CartoDB Dark'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            )}
            
            {/* Boundaries highlights */}
            <BoundaryOverlay />

            {/* Render markers */}
            {filtered.map(sub => {
              const borderCol = sub.type === 'suggestion' ? '#FF9933' : '#138808';
              return (
                <React.Fragment key={sub.id}>
                  {/* Subtle outer tricolor indicator border ring */}
                  <CircleMarker
                    center={[sub.location.lat, sub.location.lng]}
                    radius={(urgencyRadius[sub.urgency] || 10) + 3}
                    pathOptions={{
                      color: borderCol,
                      fillColor: 'transparent',
                      weight: 1.5,
                      dashArray: '3 3'
                    }}
                  />
                  <CircleMarker
                    center={[sub.location.lat, sub.location.lng]}
                    radius={urgencyRadius[sub.urgency] || 10}
                    pathOptions={{
                      color: urgencyColor[sub.urgency] || '#6b7280',
                      fillColor: urgencyColor[sub.urgency] || '#6b7280',
                      fillOpacity: 0.75,
                      weight: 1.5,
                    }}
                    eventHandlers={{ click: () => setSelectedSub(sub) }}
                  >
                    <Popup>
                      <div className="min-w-56 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-200 leading-tight">{sub.title}</h4>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white shrink-0 ml-2"
                            style={{ background: urgencyColor[sub.urgency] }}>
                            {sub.urgency}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{sub.description}</p>
                        <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-800">
                          Dept: <b className="text-slate-300">{sub.department || 'Not Assigned'}</b>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Polygon analysis floating stats box */}
          {drawnBox && (
            <div className="absolute top-4 left-4 z-[1000] glass-panel border border-brand-500/30 p-4 rounded-xl max-w-xs space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Bounding Area Metrics
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Captured pins</span>
                  <span className="text-slate-200 font-bold">{Math.round(filtered.length * 0.4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Priority</span>
                  <span className="text-slate-200 font-bold">81/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Budget Req</span>
                  <span className="text-emerald-400 font-bold">₹24.8 Lakhs</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GIS Sidebar Drawer */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto shrink-0">
          {selectedSub ? (
            <GlassCard className="border border-brand-500/30 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {selectedSub.type || 'Complaint'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 mt-2">{selectedSub.title}</h4>
                </div>
                <button onClick={() => setSelectedSub(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Priority Score</p>
                  <p className="text-base font-black text-brand-400">{selectedSub.priorityScore}/100</p>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Urgency</p>
                  <p className="text-base font-black text-red-400 capitalize">{selectedSub.urgency}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Responsibility</span>
                  <span className="text-slate-300 font-semibold truncate max-w-40">
                    {selectedSub.department || 'Awaiting Officer Review'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Officer</span>
                  <span className="text-slate-300 font-semibold">{selectedSub.assignedOfficerName || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">District / Village</span>
                  <span className="text-slate-300 font-semibold truncate max-w-40">
                    {selectedSub.location?.district} / {selectedSub.location?.village || 'Local'}
                  </span>
                </div>
              </div>

              {selectedSub.aiAnalysis?.suggestedSchemes && selectedSub.aiAnalysis.suggestedSchemes.length > 0 && (
                <div className="space-y-1.5 border-t border-slate-800 pt-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Suggested Schemes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSub.aiAnalysis.suggestedSchemes.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSub.aiAnalysis?.urgencyReasoning && (
                <div className="space-y-1 border-t border-slate-800 pt-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">AI Reasoning</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{selectedSub.aiAnalysis.urgencyReasoning}</p>
                </div>
              )}

              {/* Integrated Government Datasets */}
              {govData && (
                <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-brand-400" /> Integrated Gov Datasets
                  </p>
                  
                  {/* IMD Weather */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-[10px] text-slate-300">
                      <span>IMD Weather Forecast</span>
                      <span className="text-brand-400">{govData.weather?.temperature}°C • {govData.weather?.condition}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{govData.weather?.forecast}</p>
                  </div>

                  {/* NFHS Health indicators */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-[10px] text-slate-300">
                      <span>NFHS Health Profile</span>
                      <span className="text-cyan-400">IMR: {govData.nfhs?.infantMortalityRate}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Malnutrition: {govData.nfhs?.malnutritionPercent}%</span>
                      <span>Institutional Delivery: {govData.nfhs?.institutionalDeliveryPercent}%</span>
                    </div>
                  </div>

                  {/* PMGSY Road Network */}
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-[10px] text-slate-300">
                      <span>PMGSY Grid Length</span>
                      <span className="text-indigo-400">{govData.pmgsy?.totalLengthKm} km</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Paved: {govData.pmgsy?.pavedLengthKm} km</span>
                      <span>Unpaved: {govData.pmgsy?.unpavedLengthKm} km</span>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="border border-white/5 text-center py-12">
              <Target className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Click a pin on the map to inspect regional GIS analysis details</p>
            </GlassCard>
          )}

          {/* GIS Infrastructure Alert list */}
          <GlassCard className="border border-red-500/15 bg-red-500/3 space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Active High Alert Hotspots
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filtered.filter(s => s.urgency === 'critical').slice(0, 4).map(sub => (
                <div key={sub.id} onClick={() => setSelectedSub(sub)} className="p-2 bg-slate-950/60 rounded border border-white/5 cursor-pointer hover:border-red-500/30 transition-all text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-300 truncate max-w-44">{sub.title}</span>
                    <span className="text-red-400 font-bold">Score: {sub.priorityScore}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{sub.location?.district} • {sub.category}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
