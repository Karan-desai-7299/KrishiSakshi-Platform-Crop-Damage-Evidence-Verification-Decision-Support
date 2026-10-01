import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CloudRain, 
  Calendar, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  Sparkles, 
  Table, 
  BarChart2, 
  MapPin, 
  Info,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import MapboxView from '../components/MapboxView';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../api/config';

export default function EventMonitorPage() {
  const { strings, isMarathi } = useLanguage();
  const t = strings.eventMonitor || {};
  const c = strings.common || {};

  // Date range defaults: 2024-07-22 to 2024-07-26 (Real historic Kolhapur monsoon heavy rain event)
  const [startDate, setStartDate] = useState('2024-07-22');
  const [endDate, setEndDate] = useState('2024-07-26');
  const [thresholdMm, setThresholdMm] = useState(100);

  // States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Peak window finder state
  const [isScanningPeak, setIsScanningPeak] = useState(false);
  const [peakSuggestion, setPeakSuggestion] = useState(null);

  // Event & Alert creation state
  const [createdEvent, setCreatedEvent] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Compute maximum allowed date: today - 5 days
  const now = new Date();
  const maxAllowedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
  const maxAllowedStr = maxAllowedDate.toISOString().split('T')[0];

  // Run initial analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCreatedEvent(null);
    setAlertResult(null);

    try {
      const res = await axios.post(`${API_URL}/events/analyze`, {
        startDate,
        endDate,
        thresholdMm: Number(thresholdMm)
      });

      if (res.data?.success) {
        setAnalysisData(res.data.data);
      } else {
        setErrorMessage(res.data?.error?.message || 'Failed to analyze event.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error?.message || err.message || 'Error connecting to weather service.'
      );
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFindPeakWindow = async () => {
    setIsScanningPeak(true);
    setErrorMessage(null);
    try {
      const res = await axios.post(`${API_URL}/events/peak-window`, {
        seasonYear: 2024,
        windowDays: 5
      });

      if (res.data?.success) {
        setPeakSuggestion(res.data.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Error finding peak rainfall window.');
    } finally {
      setIsScanningPeak(false);
    }
  };

  const applyPeakSuggestion = () => {
    if (!peakSuggestion) return;
    setStartDate(peakSuggestion.peakStartDate);
    setEndDate(peakSuggestion.peakEndDate);
    setPeakSuggestion(null);
  };

  const handleCreateEvent = async () => {
    if (!analysisData) return;
    setIsCreatingEvent(true);
    setErrorMessage(null);

    try {
      const res = await axios.post(`${API_URL}/events`, {
        startDate,
        endDate,
        thresholdMm: Number(thresholdMm),
        regionId: 'KOLHAPUR_DISTRICT',
        regionName: 'Kolhapur District'
      });

      if (res.data?.success) {
        setCreatedEvent(res.data.data.weatherEvent);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to create weather event.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleSendAlert = async () => {
    if (!createdEvent) return;
    setIsSendingAlert(true);
    setErrorMessage(null);

    try {
      const res = await axios.post(`${API_URL}/events/${createdEvent.eventId}/alert`);
      if (res.data?.success) {
        setAlertResult(res.data.data);
        setCreatedEvent(res.data.data.event);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to dispatch simulated alert.');
    } finally {
      setIsSendingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Screen Identification */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {isMarathi ? 'स्क्रीन १ • अधिकारी नियंत्रण' : 'Screen 1 • Officer Portal'}
            </span>
            <span className="text-xs text-content-secondary">
              {isMarathi ? 'कोल्हापूर जिल्हा कार्यक्षेत्र' : 'Kolhapur District Zone'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-content-main mt-1">
            {t.title || (isMarathi ? 'हवामान घटना नोंदणी कक्ष' : 'Weather Event Monitor')}
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            {t.subtitle || (isMarathi ? 'ऐतिहासिक हवामान पुनर्विश्लेषण (ERA5) आधारित अतिवृष्टी शोध व शेतकरी सूचना प्रणाली.' : 'Replay historical extreme rainfall from gridded meteorological reanalysis to detect potential event triggers.')}
          </p>
        </div>

        {/* Mandatory Honesty Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2.5 py-1 bg-white border border-border-default rounded-md text-[11px] text-content-main font-medium shadow-subtle flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>{isMarathi ? 'डेटा: ग्रिडेड पुनर्गणना अंदाज (Open-Meteo)' : 'Data: Gridded reanalysis estimate (Open-Meteo)'}</span>
          </div>
          <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-priority-warning font-medium flex items-center gap-1.5">
            <Info size={12} />
            <span>{isMarathi ? 'मर्यादा: प्रोटोटाइप नियम — बदलण्याजोगे, अधिकृत सरकारी मर्यादा नाही.' : 'Threshold: prototype heuristic — configurable, not an official government threshold.'}</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Parameters & Peak Window Finder */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                <span>{t.startDate || (isMarathi ? 'सुरुवात दिनांक' : 'Start Date')}</span>
              </label>
              <input
                type="date"
                value={startDate}
                max={maxAllowedStr}
                onChange={(e) => setStartDate(e.target.value)}
                className="farmer-tap-target w-full px-3 py-1.5 bg-page border border-border-default rounded-md text-xs font-medium text-content-main focus:outline-none focus:border-primary"
              />
            </div>

            {/* End Date with 5-day past constraint */}
            <div>
              <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                <span>{isMarathi ? `शेवट दिनांक (कमाल: ${maxAllowedStr})` : `End Date (Max: ${maxAllowedStr})`}</span>
              </label>
              <input
                type="date"
                value={endDate}
                max={maxAllowedStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="farmer-tap-target w-full px-3 py-1.5 bg-page border border-border-default rounded-md text-xs font-medium text-content-main focus:outline-none focus:border-primary"
              />
            </div>

            {/* Heuristic Threshold */}
            <div>
              <label className="block text-xs font-semibold text-content-main mb-1 flex items-center gap-1.5">
                <CloudRain size={13} className="text-primary" />
                <span>{t.threshold || (isMarathi ? 'नुकसान मर्यादा (एकूण पाऊस मिमी)' : 'Threshold (Cumulative mm)')}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="500"
                  step="10"
                  value={thresholdMm}
                  onChange={(e) => setThresholdMm(e.target.value)}
                  className="farmer-tap-target w-full px-3 py-1.5 bg-page border border-border-default rounded-md text-xs font-medium text-content-main focus:outline-none focus:border-primary"
                />
                <span className="absolute right-3 top-2.5 text-xs text-content-secondary font-mono">{isMarathi ? 'मिमी' : 'mm'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFindPeakWindow}
              disabled={isScanningPeak}
              className="farmer-tap-target px-3.5 py-2 bg-white hover:bg-gray-50 border border-border-default text-content-main rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-subtle shrink-0"
              title={isMarathi ? 'अतिवृष्टीचा काळ शोधण्यासाठी मागील मान्सून स्कॅन करा' : 'Scans past monsoon to find highest rainfall period'}
            >
              <Sparkles size={14} className="text-accent-gold" />
              <span>{isScanningPeak ? (isMarathi ? 'शोध सुरू आहे...' : 'Scanning Season...') : (t.scanPeakBtn || (isMarathi ? 'अतिवृष्टीचा काळ शोधा' : 'Find Peak Rainfall Window'))}</span>
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="farmer-tap-target px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shrink-0"
            >
              <Search size={14} />
              <span>{isAnalyzing ? (isMarathi ? 'माहिती आणत आहे...' : 'Fetching Reanalysis...') : (t.analyzeBtn || (isMarathi ? 'हवामान विश्लेषण करा' : 'Analyze Event'))}</span>
            </button>
          </div>
        </div>

        {/* Peak Window Suggestion Box */}
        {peakSuggestion && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-content-main">{isMarathi ? 'मान्सून फेरनोंद सूचना: ' : 'Monsoon Replay Suggestion: '}</span>
                <span className="text-content-main">{peakSuggestion.suggestion}</span>
              </div>
            </div>
            <button
              onClick={applyPeakSuggestion}
              className="farmer-tap-target px-3 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-dark shrink-0"
            >
              {isMarathi ? 'सुचवलेल्या तारखा लागू करा' : 'Apply Suggested Dates'}
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-priority-high font-medium">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Summary Alert Banner */}
          <div className={`p-4 rounded-card border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            analysisData.hasTriggeredEvent 
              ? 'bg-red-50 border-red-200 text-priority-high' 
              : 'bg-green-50 border-green-200 text-agri'
          }`}>
            <div className="flex items-center gap-3">
              {analysisData.hasTriggeredEvent ? (
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} className="text-priority-high" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle size={20} className="text-agri" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold">
                  {analysisData.summary}
                </h3>
                <p className="text-xs text-content-secondary mt-0.5">
                  {isMarathi 
                    ? `मूल्यांकन काळ: ${analysisData.startDate} ते ${analysisData.endDate} • मर्यादा: ${analysisData.thresholdMm} मिमी`
                    : `Evaluation period: ${analysisData.startDate} to ${analysisData.endDate} • Threshold: ${analysisData.thresholdMm} mm`}
                </p>
              </div>
            </div>

            {/* Event Creation & Simulated Alert Workflow */}
            <div className="flex items-center gap-2 shrink-0">
              {!createdEvent ? (
                <button
                  onClick={handleCreateEvent}
                  disabled={isCreatingEvent}
                  className="farmer-tap-target px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <CloudRain size={14} />
                  <span>{isCreatingEvent ? (isMarathi ? 'तयार करत आहे...' : 'Creating...') : (t.createEventBtn || (isMarathi ? 'शेतकरी सूचना तयार करा' : 'Create Farmer Alert (EVT)'))}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white border border-border-default rounded-md text-xs">
                    <span className="text-content-secondary">{isMarathi ? 'घटना क्र.: ' : 'Event: '}</span>
                    <strong className="text-primary font-mono">{createdEvent.eventId}</strong>
                    <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                      {createdEvent.status}
                    </span>
                  </div>

                  {createdEvent.status === 'ALERT_READY' && (
                    <button
                      onClick={handleSendAlert}
                      disabled={isSendingAlert}
                      className="farmer-tap-target px-3.5 py-1.5 bg-agri hover:bg-green-800 text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Bell size={13} />
                      <span>{isSendingAlert ? (isMarathi ? 'पाठवत आहे...' : 'Sending...') : (t.sendAlertBtn || (isMarathi ? 'शेतकऱ्यांना मराठी इशारा पाठवा (Simulated)' : 'Send Farmer Alert (simulated)'))}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alert Sent Confirmation Notification */}
          {alertResult && (
            <div className="p-3 bg-agri-light border border-[#C8E6C9] rounded-md text-xs flex items-center justify-between text-agri">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} />
                <span className="font-semibold">{alertResult.message}</span>
              </div>
              <span className="bg-white px-2 py-0.5 rounded border border-[#C8E6C9] text-[10px] font-bold">
                {alertResult.badge}
              </span>
            </div>
          )}

          {/* Reanalysis Grid Caveat Box (Mandatory Honesty Rule #8) */}
          <div className="p-3 bg-gray-50 border border-border-default rounded-md text-xs text-content-secondary flex items-start gap-2">
            <Info size={15} className="text-content-secondary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-content-main">{isMarathi ? 'हवामान पुनर्गणना ग्रिड सूचना: ' : 'Meteorological Reanalysis Grid Notice: '}</span>
              <span>{analysisData.gridCaveat}</span>
              {analysisData.sharedGridCells?.length > 0 && (
                <div className="mt-1 font-mono text-[11px] text-amber-700">
                  {isMarathi 
                    ? `टीप: अनेक स्थाने एकाच ग्रिड सेलमध्ये समाविष्ट आहेत: ${JSON.stringify(analysisData.sharedGridCells)}`
                    : `Notice: Several coordinates fell inside shared grid cells: ${JSON.stringify(analysisData.sharedGridCells)}`}
                </div>
              )}
            </div>
          </div>

          {/* Visuals Grid: Bar Chart & Mapbox Circles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Bar Chart */}
            <div className="gov-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 size={15} className="text-primary" />
                    {t.barChartTitle || (isMarathi ? 'स्थाननिहाय एकूण पाऊस विरुद्ध मर्यादा (मिमी)' : 'Cumulative Rainfall vs Threshold (mm)')}
                  </h4>
                  <span className="text-[11px] text-content-secondary font-mono">
                    {isMarathi ? `मर्यादा: ${analysisData.thresholdMm} मिमी` : `Threshold: ${analysisData.thresholdMm} mm`}
                  </span>
                </div>
                <p className="text-[11px] text-content-secondary mb-4">
                  {isMarathi 
                    ? `निळा = पावसाची पातळी • लाल हायलाइट = मर्यादेपेक्षा जास्त (≥ ${analysisData.thresholdMm} मिमी)`
                    : `Blue = Rainfall Level • Red Highlight = Threshold-Triggered (≥ ${analysisData.thresholdMm} mm)`}
                </p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData.rainfallByLocation} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                    <XAxis 
                      dataKey="locationName" 
                      tick={{ fontSize: 11, fill: '#263238' }} 
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#607D8B' }} />
                    <Tooltip 
                      formatter={(val) => [`${val} mm`, isMarathi ? 'एकूण पर्जन्य' : 'Cumulative Rainfall']}
                      labelFormatter={(label) => `${isMarathi ? 'ठिकाण' : 'Location'}: ${label}`}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D9E0E6', fontSize: '12px' }}
                    />
                    <ReferenceLine 
                      y={analysisData.thresholdMm} 
                      stroke="#C62828" 
                      strokeDasharray="4 4" 
                      label={{ value: `${isMarathi ? 'मर्यादा' : 'Threshold'} (${analysisData.thresholdMm} mm)`, fill: '#C62828', fontSize: 10, position: 'top' }} 
                    />
                    <Bar dataKey="cumulativeRainfallMm" radius={[4, 4, 0, 0]}>
                      {analysisData.rainfallByLocation.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.thresholdExceeded ? '#C62828' : '#1565C0'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mapbox GIS Circles */}
            <div className="gov-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={15} className="text-primary" />
                  {isMarathi ? 'भू-स्थानिक नकाशा वर्तुळे (GIS Overlays)' : 'GIS Circle Overlays'}
                </h4>
                <span className="text-[11px] text-content-secondary">
                  {isMarathi ? '५ संदर्भ स्थाने' : '5 Reference Points'}
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mb-3">
                {isMarathi 
                  ? 'वर्तुळांचा रंग कोल्हापूर जिल्ह्यातील पावसाची तीव्रता दर्शवतो.' 
                  : 'Circle colors reflect rainfall severity across the Kolhapur monitoring zone.'}
              </p>

              <MapboxView 
                locationsData={analysisData.rainfallByLocation}
                thresholdMm={analysisData.thresholdMm}
              />
            </div>
          </div>

          {/* Detailed Meteorological Table */}
          <div className="gov-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Table size={15} className="text-primary" />
                <h4 className="text-xs font-bold text-content-main uppercase tracking-wider">
                  {isMarathi ? 'स्थाननिहाय हवामान पुनर्गणना तपशील' : 'Location Reanalysis Metrics'}
                </h4>
              </div>
              <span className="text-[11px] text-content-secondary font-mono">
                {isMarathi ? 'स्रोत: ' : 'Source: '}{analysisData.source}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-default bg-page text-content-secondary uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'स्थान' : 'Location'}</th>
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'अंदाजे अक्षांश-रेखांश' : 'Approx. Coordinates'}</th>
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'ग्रिड अक्षांश-रेखांश' : 'Grid Coordinates'}</th>
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'उंची' : 'Elevation'}</th>
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'एकूण पाऊस' : 'Cumulative Rain'}</th>
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'कमाल एक दिवसाचा' : 'Max Single-Day'}</th>
                    <th className="py-2.5 px-4 font-semibold">{isMarathi ? 'स्थिती' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-content-main">
                  {analysisData.rainfallByLocation.map((loc) => (
                    <tr 
                      key={loc.locationName}
                      className={loc.thresholdExceeded ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-gray-50'}
                    >
                      <td className="py-3 px-4 font-bold">{loc.locationName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-content-secondary">
                        {loc.latitude.toFixed(3)}° N, {loc.longitude.toFixed(3)}° E
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-content-secondary">
                        {loc.gridLatitude?.toFixed(3)}° N, {loc.gridLongitude?.toFixed(3)}° E
                      </td>
                      <td className="py-3 px-4">{loc.elevation ? `${loc.elevation} m` : 'N/A'}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className={loc.thresholdExceeded ? 'text-priority-high' : 'text-primary'}>
                          {loc.cumulativeRainfallMm} mm
                        </span>
                      </td>
                      <td className="py-3 px-4 text-content-secondary font-medium">
                        {loc.maxSingleDayMm} mm
                      </td>
                      <td className="py-3 px-4">
                        {loc.thresholdExceeded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-priority-high border border-red-200">
                            <AlertTriangle size={11} />
                            {isMarathi ? 'मर्यादा ओलांडली' : 'Threshold Flagged'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-content-secondary">
                            {isMarathi ? 'मर्यादेच्या आत' : 'Below Threshold'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
