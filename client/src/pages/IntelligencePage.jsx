import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Cpu, 
  CloudRain, 
  Users, 
  Satellite, 
  Sliders, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../api/config';

export default function IntelligencePage() {
  const { user } = useAuth();
  const { strings, isMarathi } = useLanguage();
  const t = strings.intelligence || {};
  const c = strings.common || {};

  // State
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [radiusM, setRadiusM] = useState(1000);
  const [minReports, setMinReports] = useState(3);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [clusterData, setClusterData] = useState(null);
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      if (res.data?.success && res.data.data.length > 0) {
        setEvents(res.data.data);
        setSelectedEventId(res.data.data[0].eventId);
        generateClusters(res.data.data[0].eventId, radiusM, minReports);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const generateClusters = async (eventId, radius, minR) => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await axios.post(`${API_URL}/clusters/generate`, {
        eventId: eventId || selectedEventId,
        radiusM: Number(radius),
        minReports: Number(minR),
        regionId: 'KOLHAPUR_DISTRICT'
      });

      if (res.data?.success) {
        setClusterData(res.data.data);
        setSelectedClusterIndex(0);
      } else {
        setErrorMessage(res.data?.error?.message || 'Cluster generation failed.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error?.message || err.message || 'Error generating clusters.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = (e) => {
    e.preventDefault();
    generateClusters(selectedEventId, radiusM, minReports);
  };

  const selectedCluster = clusterData?.clusters?.[selectedClusterIndex] || null;

  return (
    <div className="space-y-6">
      {/* Title & Screen Identification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {isMarathi ? 'स्क्रीन ३ • अधिकारी पुरावा संकलन' : 'Screen 3 • Officer Intelligence'}
            </span>
            <span className="text-xs text-content-secondary">
              {isMarathi ? 'तांत्रिक केंद्र' : 'Technical Heart'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-content-main mt-1">
            {t.title || (isMarathi ? 'पुरावा एकत्रीकरण आणि गट विश्लेषण' : 'Evidence Intelligence & Cluster Engine')}
          </h2>
          <p className="text-xs text-content-secondary">
            {t.subtitle || (isMarathi 
              ? 'हवामान पुनर्विश्लेषण, शेतकऱ्यांचे प्राथमिक अहवाल आणि उपग्रह बदलांचा नियम-आधारित तुलनात्मक अभ्यास.'
              : 'Multi-evidence fusion combining meteorological reanalysis, farmer field reports, and satellite proxies into explainable verification priorities.')}
          </p>
        </div>

        {/* Mandatory Honesty Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 bg-white border border-border-default rounded text-[11px] font-medium text-content-main shadow-subtle flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>{isMarathi ? 'नियम-आधारित निर्णय साहाय्य (AI नाही)' : 'Rule-based decision support (Not AI)'}</span>
          </div>
          <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-[11px] font-medium text-priority-warning flex items-center gap-1.5">
            <Info size={12} />
            <span>{isMarathi ? 'त्रिज्या १ किमी — प्रोटोटाइप नियम, अंतिम सरकारी मानक नाही' : 'Radius 1 km — prototype setting, not a validated value'}</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Event Selector & Adjustable Proximity Heuristics */}
      <form onSubmit={handleRegenerate} className="gov-card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Event Selector */}
          <div>
            <label className="block text-xs font-semibold text-content-main mb-1">
              {t.eventSelectLabel || (isMarathi ? 'आपत्ती घटना निवडा' : 'Select Replay Event')}
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="farmer-tap-target w-full px-3 py-1.5 bg-page border border-border-default rounded text-xs font-medium text-content-main focus:outline-none focus:border-primary"
            >
              {events.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.eventId} ({ev.startDate} to {ev.endDate}) • {ev.thresholdMm}mm
                </option>
              ))}
            </select>
          </div>

          {/* Proximity Radius Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-content-main">
                {t.radiusLabel || (isMarathi ? 'समीपता त्रिज्या:' : 'Proximity Radius:')} <strong className="font-mono text-primary">{radiusM} m</strong>
              </label>
              <span className="text-[10px] text-content-secondary">{(radiusM / 1000).toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="250"
              value={radiusM}
              onChange={(e) => setRadiusM(e.target.value)}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Minimum Reports Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-content-main">
                {t.minReportsLabel || (isMarathi ? 'किमान स्वतंत्र अहवाल:' : 'Min. Independent Reports:')} <strong className="font-mono text-primary">{minReports}</strong>
              </label>
              <span className="text-[10px] text-content-secondary">{isMarathi ? 'मर्यादा' : 'Threshold'}</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={minReports}
              onChange={(e) => setMinReports(e.target.value)}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
          <p className="text-[11px] text-content-secondary">
            {isMarathi 
              ? 'पॅरामीटर्स बदलल्यास Haversine अंतर आणि MongoDB 2dsphere इंडेक्सिंग वापरून भू-स्थानिक गट पुन्हा तयार केले जातात.'
              : 'Adjusting parameters regenerates geospatial clusters using Haversine distance and MongoDB 2dsphere indexing.'}
          </p>
          <button
            type="submit"
            disabled={isGenerating}
            className="farmer-tap-target px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-colors"
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? (isMarathi ? 'तयार करत आहे...' : 'Regenerating...') : (t.recalculateBtn || (isMarathi ? 'गट पुन्हा तयार करा' : 'Regenerate Clusters'))}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-priority-high flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Cluster Engine Summary Notice (Mandatory Honesty Rule #10, #12, #13) */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs text-content-secondary space-y-1">
        <div className="font-bold text-content-main flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-primary" />
          <span>{isMarathi ? 'भू-स्थानिक गट निर्णय साहाय्य चौकट' : 'Geospatial Cluster Decision Support Framework'}</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {clusterData?.wordingNotice || (isMarathi 
            ? 'एकाच भागातील अनेक स्वतंत्र अहवाल संभाव्य नुकसान क्षेत्र दर्शवतात ज्याची प्रत्यक्ष पडताळणी आवश्यक आहे.'
            : 'Multiple independent reports indicate a potential damage cluster requiring verification.')} {clusterData?.radiusNotice} {isMarathi 
            ? 'हवामान पुनर्विश्लेषण ग्रिड सुमारे ९ ते २५ किमी असते. त्यामुळे क्लस्टरचा पाऊस जवळच्या ग्रिड सेलवरून येतो, १ किमी अचूकतेचा दावा केला जात नाही.'
            : "The reanalysis grid is about 9–25 km. A cluster's rainfall comes from the nearest grid cell, so proximity does not imply 1 km rainfall precision."}
        </p>
      </div>

      {/* THREE EVIDENCE SOURCES COLUMNS (Page 8 Specification) */}
      {selectedCluster && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: WEATHER SIGNAL */}
          <div className="gov-card p-4 border-t-4 border-t-primary flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <span className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                  <CloudRain size={16} className="text-primary" />
                  {t.col1Title || (isMarathi ? '१. हवामान पुरावा' : '1. Weather Signal')}
                </span>
                <span className="text-[10px] bg-blue-50 text-primary px-1.5 py-0.5 rounded font-mono">
                  ERA5 Grid
                </span>
              </div>

              <div>
                <span className="text-[11px] text-content-secondary block">
                  {isMarathi ? 'गट परिसरातील एकूण पाऊस' : 'Cluster-Area Cumulative Rainfall'}
                </span>
                <div className="text-xl font-bold font-mono text-content-main">
                  {selectedCluster.clusterRainfallMm || 120} mm
                </div>
                <span className="text-[10px] text-content-secondary">
                  {isMarathi 
                    ? `प्रोटोटाइप मर्यादा: १०० मिमी (ओलांडली: ${selectedCluster.clusterRainfallMm >= 100 ? 'होय' : 'नाही'})`
                    : `Prototype Threshold: 100 mm (Triggered: ${selectedCluster.clusterRainfallMm >= 100 ? 'Yes' : 'No'})`}
                </span>
              </div>

              <div className="p-2 bg-page border border-border-default rounded text-[11px] text-content-secondary">
                <span className="font-semibold text-content-main">{isMarathi ? 'स्रोत: ' : 'Attribution: '}</span>
                <span>
                  {isMarathi 
                    ? 'ग्रिडेड पुनर्गणना अंदाज (Open-Meteo). पाऊस जवळच्या ग्रिड सेलवरून जोडला गेला आहे.'
                    : 'Gridded reanalysis estimate (Open-Meteo). Rainfall assigned from nearest grid cell.'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-content-secondary font-mono flex items-center justify-between">
              <span>{isMarathi ? 'घटक भार: ३०%' : 'Factor Weight: 30%'}</span>
              <span className="font-bold text-primary">{isMarathi ? 'गुण' : 'Score'}: {selectedCluster.priorityDetails?.factors?.fRain || 1.0}</span>
            </div>
          </div>

          {/* Column 2: FARMER REPORTS SIGNAL */}
          <div className="gov-card p-4 border-t-4 border-t-agri flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <span className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={16} className="text-agri" />
                  {t.col2Title || (isMarathi ? '२. शेतकरी अहवाल' : '2. Farmer Reports')}
                </span>
                <span className="text-[10px] bg-green-50 text-agri px-1.5 py-0.5 rounded font-mono">
                  {selectedCluster.reportCount} {isMarathi ? 'अहवाल' : 'Reports'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-content-secondary text-[10px] block">
                    {isMarathi ? 'प्रमुख पीक' : 'Dominant Crop'}
                  </span>
                  <strong className="text-content-main">{selectedCluster.dominantCrop}</strong>
                </div>
                <div>
                  <span className="text-content-secondary text-[10px] block">
                    {isMarathi ? 'नुकसान प्रकार' : 'Dominant Damage'}
                  </span>
                  <strong className="text-priority-high">{selectedCluster.dominantDamageType}</strong>
                </div>
                <div>
                  <span className="text-content-secondary text-[10px] block">
                    {isMarathi ? 'गट त्रिज्या' : 'Cluster Radius'}
                  </span>
                  <strong className="text-content-main font-mono">{radiusM} m</strong>
                </div>
                <div>
                  <span className="text-content-secondary text-[10px] block">
                    {isMarathi ? 'वेळ विस्तार' : 'Time Spread'}
                  </span>
                  <strong className="text-content-main">{selectedCluster.timeSpread?.spreadHours || 12}h</strong>
                </div>
              </div>

              <div className="p-2 bg-page border border-border-default rounded text-[11px] text-content-secondary">
                <span className="font-semibold text-content-main">{isMarathi ? 'सुसंगतता: ' : 'Corroboration: '}</span>
                <span>
                  {isMarathi 
                    ? `स्वतंत्र शेतकऱ्यांचे ${(radiusM/1000).toFixed(1)} किमी परिघातील दावे.`
                    : `Independent farmer submissions within ${(radiusM/1000).toFixed(1)} km boundary.`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-content-secondary font-mono flex items-center justify-between">
              <span>{isMarathi ? 'घटक भार: २५% (घनता)' : 'Factor Weight: 25% (Density)'}</span>
              <span className="font-bold text-agri">{isMarathi ? 'गुण' : 'Score'}: {selectedCluster.priorityDetails?.factors?.fDensity || 0.8}</span>
            </div>
          </div>

          {/* Column 3: SATELLITE LAYER (SIMULATED) */}
          <div className="gov-card p-4 border-t-4 border-t-priority-warning flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-default pb-2">
                <span className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                  <Satellite size={16} className="text-priority-warning" />
                  {t.col3Title || (isMarathi ? '३. उपग्रह स्तर (Simulated)' : '3. Satellite Layer')}
                </span>
                <span className="text-[10px] bg-amber-50 text-priority-warning px-1.5 py-0.5 rounded font-mono font-bold">
                  {isMarathi ? 'प्रात्यक्षिक (SIMULATED)' : 'SIMULATED'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-content-secondary block">
                  {isMarathi ? 'SAR पृष्ठभाग सुसंगतता प्रात्यक्षिक' : 'SAR Surface Coherence Proxy'}
                </span>
                <div className="text-sm font-bold text-content-main mt-0.5">
                  {isMarathi ? 'पृष्ठभाग बदलाशी सुसंगत निर्देशांक' : (selectedCluster.satellite?.signal || 'Consistent with possible surface change')}
                </div>
                <span className="text-[10px] text-content-secondary">
                  {isMarathi 
                    ? `विश्वासार्हता: ${selectedCluster.satellite?.confidence || 'मध्यम'} • सेंटिनेल-१ कृत्रिम`
                    : `Confidence: ${selectedCluster.satellite?.confidence || 'Moderate'} • Sentinel-1 Synthetic`}
                </span>
              </div>

              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-priority-warning font-medium">
                <span>{isMarathi 
                  ? 'SIMULATED — केवळ प्रोटोटाइपसाठी. प्रत्यक्ष रडार बॅकस्कॅटर भविष्यातील टप्प्यात असेल.'
                  : 'SIMULATED — prototype only. Real radar backscatter processing is roadmap only.'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-content-secondary font-mono flex items-center justify-between">
              <span>{isMarathi ? 'घटक भार: १५%' : 'Factor Weight: 15%'}</span>
              <span className="font-bold text-priority-warning">{isMarathi ? 'गुण' : 'Score'}: {selectedCluster.priorityDetails?.factors?.fSatellite || 0.8}</span>
            </div>
          </div>
        </div>
      )}

      {/* CLUSTERS SELECTION & WHY THIS PRIORITY? SECTION */}
      {clusterData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Clusters List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-primary" />
                <span>{t.clustersFoundTitle || (isMarathi ? 'शोधलेली संभाव्य क्षेत्रे' : 'Detected Potential Clusters')} ({clusterData.totalClusters})</span>
              </h3>
              <span className="text-[10px] text-content-secondary font-mono">
                {isMarathi ? 'प्राधान्य गुणक्रमानुसार' : 'Sorted by Priority Score'}
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {clusterData.clusters.map((clu, i) => {
                const isSelected = i === selectedClusterIndex;
                const levelColor = 
                  clu.priorityLevel === 'HIGH' ? 'text-priority-high bg-red-50 border-red-200' :
                  clu.priorityLevel === 'MEDIUM' ? 'text-priority-medium bg-orange-50 border-orange-200' :
                  'text-priority-warning bg-amber-50 border-amber-200';

                return (
                  <div
                    key={clu.clusterId}
                    onClick={() => setSelectedClusterIndex(i)}
                    className={`gov-card p-3 cursor-pointer transition-all border ${
                      isSelected ? 'border-primary ring-2 ring-primary/20 bg-blue-50/20' : 'hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-content-main">
                        {clu.clusterId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${levelColor}`}>
                        {clu.priorityLevel} ({clu.priorityScore})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-content-secondary mt-2">
                      <div>
                        <span>{isMarathi ? 'अहवाल: ' : 'Reports: '}</span>
                        <strong className="text-content-main">{clu.reportCount}</strong>
                      </div>
                      <div>
                        <span>{isMarathi ? 'प्रमुख पीक: ' : 'Dominant: '}</span>
                        <strong className="text-content-main">{clu.dominantCrop}</strong>
                      </div>
                      <div>
                        <span>{isMarathi ? 'नुकसान: ' : 'Damage: '}</span>
                        <strong className="text-priority-high">{clu.dominantDamageType}</strong>
                      </div>
                      <div className="font-mono text-[10px]">
                        {(clu.center?.coordinates || clu.centroid?.coordinates || [74.35, 16.68])[1].toFixed(3)}°, {(clu.center?.coordinates || clu.centroid?.coordinates || [74.35, 16.68])[0].toFixed(3)}°
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Cluster Detail & Explainable WHY List */}
          {selectedCluster && (
            <div className="lg:col-span-7 space-y-4">
              {/* Priority Score Header */}
              <div className="gov-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border-default pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-content-secondary uppercase tracking-wider">
                      {isMarathi ? 'निवडलेल्या क्षेत्राची माहिती' : 'Selected Cluster Case File'}
                    </span>
                    <h4 className="text-base font-bold font-mono text-content-main">
                      {selectedCluster.clusterId}
                    </h4>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-content-secondary uppercase">
                      {isMarathi ? 'गणित केलेले प्राधान्य गुण' : 'Computed Priority Score'}
                    </div>
                    <div className="text-2xl font-bold font-mono text-primary leading-tight">
                      {selectedCluster.priorityScore} / 100
                    </div>
                  </div>
                </div>

                {/* MANDATORY WHY LIST (Page 8 Specification) */}
                <div>
                  <h5 className="text-xs font-bold text-content-main uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-primary" />
                    <span>{t.whyChecklistTitle || (isMarathi ? 'प्राधान्यक्रमाची कारणे (Explainable Factor Breakdown)' : 'WHY this priority? (Explainable Factor Breakdown)')}</span>
                  </h5>

                  <div className="space-y-1.5 text-xs">
                    {(selectedCluster.priorityDetails?.reasons || selectedCluster.reasons?.map(r => ({ text: r, status: r.startsWith('✓') ? 'TRUE' : 'FALSE' })) || []).map((reason, idx) => {
                      const isTrue = reason.status === 'TRUE' || (typeof reason === 'string' && reason.startsWith('✓'));
                      const isSimulated = typeof reason === 'string' ? reason.startsWith('○') : reason.status === 'SUPPORTING';

                      return (
                        <div 
                          key={idx} 
                          className={`p-2 rounded border flex items-center justify-between ${
                            isTrue 
                              ? 'bg-green-50/70 border-green-200 text-content-main' 
                              : isSimulated 
                              ? 'bg-amber-50/60 border-amber-200 text-content-main'
                              : 'bg-gray-50 border-gray-200 text-content-secondary'
                          }`}
                        >
                          <span className="font-medium text-[11px]">
                            {reason.text || reason}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isTrue ? 'bg-agri text-white' : isSimulated ? 'bg-amber-100 text-priority-warning' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isTrue ? (isMarathi ? 'प्रमाणित' : 'Verified') : isSimulated ? (isMarathi ? 'प्रात्यक्षिक' : 'Simulated') : (isMarathi ? 'अपूर्ण' : 'Unmet')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Evidence Consistency Per-item Evaluation (Page 8 Specification) */}
                <div className="pt-2 border-t border-border-default">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-content-main uppercase tracking-wider">
                      {isMarathi ? 'पुरावा सुसंगतता मूल्यांकन' : 'Evidence Consistency Assessment'}
                    </h5>
                    <span className="text-[11px] font-bold text-agri bg-agri-light px-2 py-0.5 rounded border border-[#C8E6C9]">
                      {selectedCluster.evidenceDetails?.overall || (isMarathi ? 'समर्थक पुरावे उपलब्ध' : 'Supporting evidence')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {(selectedCluster.evidenceDetails?.items || []).map((item, idx) => (
                      <div key={idx} className="p-2 bg-page border border-border-default rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-content-main">{item.name}</span>
                          <span className="text-[10px] font-bold text-primary">{item.status}</span>
                        </div>
                        <p className="text-[10px] text-content-secondary mt-0.5">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal / Authority Disclaimer */}
                <div className="p-2.5 bg-gray-50 border border-border-default rounded text-[10px] text-content-secondary">
                  <span>
                    {isMarathi 
                      ? 'सुरुवातीचा प्रोटोटाइप नियम — बदलण्याजोगा. हा गुण केवळ पंचनाम्याचा क्रम ठरवतो, नुकसानभरपाई निश्चित करत नाही.'
                      : (selectedCluster.priorityDetails?.heuristicDisclaimer || 'Starting heuristic — adjustable, not scientifically validated. This score only suggests verification order. It does not determine compensation.')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
