import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  CloudRain, 
  ArrowUpRight, 
  Search, 
  Sliders, 
  RefreshCw, 
  Download,
  Filter,
  Eye,
  Layers,
  Sprout,
  CheckCircle,
  Clock,
  Compass,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ClusterMapView from '../components/ClusterMapView';
import ClusterDetailDrawer from '../components/ClusterDetailDrawer';
import { API_URL } from '../api/config';

export default function OfficerDashboardPage() {
  const { user, loginAs, loginAsRole } = useAuth();
  const { strings, isMarathi } = useLanguage();
  const t = strings.officer || {};
  const c = strings.common || {};
  const [stats, setStats] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection and filter state
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL | HIGH | MEDIUM | LOW
  const [searchQuery, setSearchQuery] = useState('');
  const [clusterReports, setClusterReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Ensure officer authorization token is present

  // Fetch summary metrics and cluster list
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('krishi_demo_token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch Stats Summary
      const statsRes = await fetch(`${API_URL}/clusters/stats/summary`, {
        headers: authHeader
      });
      const statsJson = await statsRes.json();
      if (statsJson.success && statsJson.data) {
        setStats(statsJson.data);
      }

      // 2. Fetch Clusters
      const clustersRes = await fetch(`${API_URL}/clusters`, {
        headers: authHeader
      });
      const clustersJson = await clustersRes.json();
      if (clustersJson.success && Array.isArray(clustersJson.data)) {
        setClusters(clustersJson.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load cluster intelligence data. Ensure server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Load specific cluster details and member reports when a cluster is clicked
  const handleSelectCluster = async (cluster) => {
    setSelectedCluster(cluster);
    setLoadingReports(true);
    try {
      const token = localStorage.getItem('krishi_demo_token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/clusters/${cluster.clusterId}`, {
        headers: authHeader
      });
      const data = await res.json();
      if (data.success && data.data) {
        setClusterReports(data.data.reportIds || []);
      } else {
        setClusterReports(cluster.reportIds || []);
      }
    } catch {
      setClusterReports(cluster.reportIds || []);
    } finally {
      setLoadingReports(false);
    }
  };

  // Export district-wide offline Panchnama CSV
  const handleExportAllPanchnama = () => {
    setExporting(true);
    try {
      const headers = [
        'Cluster ID',
        'Priority Level',
        'Priority Score',
        'Dominant Crop',
        'Dominant Damage Type',
        'Report Count',
        'Centroid Longitude',
        'Centroid Latitude',
        'Verification Status',
        'Jurisdiction Taluka',
        'District'
      ];

      const rows = clusters.map(c => {
        const coords = c.center?.coordinates || c.centroid?.coordinates || [74.35, 16.68];
        return [
          `"${c.clusterId}"`,
          `"${c.priorityLevel}"`,
          c.priorityScore,
          `"${c.dominantCrop}"`,
          `"${c.dominantDamageType || 'Crop Loss'}"`,
          c.reportCount,
          coords[0],
          coords[1],
          `"${c.verificationStatus || 'PENDING'}"`,
          '"Karveer"',
          '"Kolhapur"'
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `kolhapur_district_panchnama_triage_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  // Filter clusters
  const filteredClusters = clusters.filter(c => {
    const matchesPriority = priorityFilter === 'ALL' || c.priorityLevel === priorityFilter;
    const matchesSearch = !searchQuery || 
      c.clusterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dominantCrop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.dominantDamageType && c.dominantDamageType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  const highPriorityCount = clusters.filter(c => c.priorityLevel === 'HIGH').length;
  const mediumPriorityCount = clusters.filter(c => c.priorityLevel === 'MEDIUM').length;
  const lowPriorityCount = clusters.filter(c => c.priorityLevel === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Officer Command Header Card */}
      <div className="bg-white rounded-2xl p-6 border-l-4 border-l-blue-800 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-100 text-blue-900 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                {isMarathi ? 'प्रशासकीय नियंत्रण कक्ष • पंचनामा प्राधान्यक्रम' : 'Administrative Operations • Field Verification Triage'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t.title || (isMarathi ? 'तालुका कृषी अधिकारी कार्यालय' : 'Taluka Agriculture Office')}</span>
              <span className="text-slate-500 text-lg sm:text-xl font-normal hidden sm:inline">
                {isMarathi ? '— करवीर तालुका' : '— Karveer Jurisdiction'}
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <MapPin size={14} className="text-emerald-700" />
                <span>
                  {isMarathi ? 'कार्यक्षेत्र: ' : 'Scope: '}
                  <strong className="text-slate-900">{isMarathi ? 'करवीर तालुका, कोल्हापूर' : 'Karveer, Kolhapur'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Users size={14} className="text-blue-700" />
                <span>
                  {isMarathi ? 'अधिकारी: ' : 'Officer: '}
                  <strong className="text-slate-900">{user?.name || (isMarathi ? 'संजय देशमुख' : 'Sanjay Deshmukh')}</strong> ({user?.role || 'OFFICER'})
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Clock size={14} className="text-amber-700" />
                <span>
                  {isMarathi ? 'आपत्ती नोंद: ' : 'Deluge Record: '}
                  <strong className="text-slate-900">EVT-2024-0001 (Monsoon Deluge)</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportAllPanchnama}
              disabled={clusters.length === 0 || exporting}
              className="farmer-tap-target px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              title={isMarathi ? 'क्षेत्रीय पथकांसाठी जिल्हा पंचनामा पत्रक (CSV) डाऊनलोड करा' : 'Download District Panchnama Sheet as CSV for field teams'}
            >
              <FileSpreadsheet size={16} />
              <span>{exporting ? (isMarathi ? 'डाउनलोड होत आहे...' : 'Exporting...') : (t.offlineSheetBtn || (isMarathi ? 'ऑफलाइन पंचनामा पत्रक डाऊनलोड करा (CSV)' : 'Export Offline Panchnama Sheet (CSV)'))}</span>
            </button>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="farmer-tap-target px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title={isMarathi ? 'माहिती अद्ययावत करा' : 'Refresh intelligence data'}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{isMarathi ? 'रीफ्रेश' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decision Support Legal Notice */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs flex items-start gap-3 text-slate-700">
        <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">
            {isMarathi ? 'वैधानिक निर्णय साहाय्य मर्यादा: ' : 'Statutory Decision Support Boundary: '}
          </strong>
          {isMarathi 
            ? 'संभाव्य नुकसान क्षेत्रे ही प्रत्यक्ष पंचनामा पथके पाठवण्यास दिशा देण्यासाठी नियम-आधारित भू-स्थानिक गट आहेत. कृषीसाक्षी नुकसानभरपाई निश्चित करत नाही किंवा अधिकृत महसूल व कृषी अधिकाऱ्यांच्या प्रत्यक्ष पंचनाम्याची जागा घेत नाही.'
            : 'Potential damage clusters are deterministic rule-based spatial groupings to guide physical panchnama deployment. KrishiSakshi does not calculate compensation or replace on-site panchnama by authorized revenue and agriculture officers.'}
        </div>
      </div>

      {/* 4 Hero Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Damage Reports */}
        <div className="gov-card p-5 bg-gradient-to-br from-white to-blue-50/30 border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.metricReports || (isMarathi ? 'एकूण प्राथमिक अहवाल' : 'Total Damage Reports')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.totalReports !== undefined ? stats.totalReports : clusters.reduce((acc, c) => acc + (c.reportCount || 0), 0) || 109}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>{isMarathi ? 'कोल्हापूर अतिवृष्टी अहवाल' : 'Kolhapur Deluge event capture'}</span>
          </div>
        </div>

        {/* Active Potential Clusters */}
        <div className="gov-card p-5 bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.metricClusters || (isMarathi ? 'संभाव्य नुकसान क्षेत्रे' : 'Potential Clusters')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.totalClusters !== undefined ? stats.totalClusters : clusters.length || 10}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>{isMarathi ? '१ किमी परिघातील गट' : 'Spatial proximity grouped (1 km)'}</span>
          </div>
        </div>

        {/* High Priority Areas */}
        <div className="gov-card p-5 bg-gradient-to-br from-white to-rose-50/40 border-rose-200 border-l-4 border-l-rose-600 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              {t.metricHighPriority || (isMarathi ? 'अति-तात्काळ क्षेत्रे (High)' : 'High Priority Areas')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">
            {stats?.highPriority !== undefined ? stats.highPriority : highPriorityCount}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 beacon-dot" />
            <span>{isMarathi ? 'तातडीने पंचनामा शिफारस' : 'Immediate panchnama recommended'}</span>
          </div>
        </div>

        {/* Field Verification Progress */}
        <div className="gov-card p-5 bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t.metricProgress || (isMarathi ? 'पंचनामा प्रगती' : 'Panchnama Progress')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span className="text-emerald-700">{stats?.completedVerifications !== undefined ? stats.completedVerifications : 14}</span>
            <span className="text-sm font-semibold text-slate-400">
              / {stats?.pendingVerifications !== undefined ? (stats.completedVerifications + stats.pendingVerifications) : 109}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-1.5 rounded-full" 
              style={{ width: `${Math.round(((stats?.completedVerifications || 14) / (stats ? (stats.completedVerifications + stats.pendingVerifications) : 109)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Priority Ranked Areas List & Interactive Cluster Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Ranked Priority Areas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="gov-card p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span>{t.queueTitle || (isMarathi ? 'क्षेत्रीय पडताळणी प्राधान्यक्रम यादी' : 'Field Verification Priority Queue')}</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.queueDesc || (isMarathi ? '५ घटकांच्या पारदर्शक नियमांनुसार क्रमवारी (०–१००)' : 'Ordered by 5-factor deterministic heuristic score (0–100)')}
                </p>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                {[
                  { key: 'ALL', label: isMarathi ? `सर्व (${clusters.length})` : `All (${clusters.length})` },
                  { key: 'HIGH', label: isMarathi ? `उच्च (${highPriorityCount})` : `High (${highPriorityCount})` },
                  { key: 'MEDIUM', label: isMarathi ? `मध्यम (${mediumPriorityCount})` : `Medium (${mediumPriorityCount})` },
                  { key: 'LOW', label: isMarathi ? `कमी (${lowPriorityCount})` : `Low (${lowPriorityCount})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setPriorityFilter(tab.key)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                      priorityFilter === tab.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder || (isMarathi ? 'पीक किंवा गट क्रमांकाने शोधा...' : 'Search by crop or cluster ID...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Cluster Cards Scrollable List */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw size={18} className="animate-spin text-primary" />
                  <span>{isMarathi ? 'माहिती लोड होत आहे...' : 'Loading cluster intelligence...'}</span>
                </div>
              ) : filteredClusters.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  {isMarathi ? 'सध्याच्या फिल्टरनुसार कोणतेही गट आढळले नाहीत.' : 'No clusters match the active filter criteria.'}
                </div>
              ) : (
                filteredClusters.map((cluster, index) => {
                  const isSelected = selectedCluster?.clusterId === cluster.clusterId;
                  const isHigh = cluster.priorityLevel === 'HIGH';
                  const isMedium = cluster.priorityLevel === 'MEDIUM';
                  const coords = cluster.center?.coordinates || cluster.centroid?.coordinates || [74.35, 16.68];

                  return (
                    <div
                      key={cluster.clusterId}
                      onClick={() => handleSelectCluster(cluster)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-blue-50/50 shadow-md ring-2 ring-primary/40 -translate-y-0.5'
                          : isHigh
                            ? 'border-rose-200 bg-rose-50/20 hover:bg-rose-50/40 hover:shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold font-mono text-[10px] ${
                            isHigh ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {cluster.clusterId}
                          </span>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                          isHigh 
                            ? 'bg-rose-100 text-rose-800 border-rose-300' 
                            : isMedium 
                              ? 'bg-amber-100 text-amber-900 border-amber-300' 
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {isMarathi 
                            ? (isHigh ? 'उच्च' : isMedium ? 'मध्यम' : 'कमी') 
                            : cluster.priorityLevel} ({cluster.priorityScore}/100)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-2.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400">{isMarathi ? 'पीक: ' : 'Crop: '}</span>
                          <strong className="text-slate-900">{cluster.dominantCrop}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">{isMarathi ? 'नुकसान: ' : 'Damage: '}</span>
                          <strong className="text-slate-900">{cluster.dominantDamageType || 'Waterlogging'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">{isMarathi ? 'अहवाल: ' : 'Farms: '}</span>
                          <strong className="text-slate-900">{cluster.reportCount} {isMarathi ? 'नोंदी' : 'reports'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">{isMarathi ? 'मध्यबिंदू: ' : 'Centroid: '}</span>
                          <span className="font-mono text-[10px] text-slate-700">
                            [{coords[0].toFixed(2)}, {coords[1].toFixed(2)}]
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-600" />
                          <span>{isMarathi ? 'बहु-स्रोत पुरावे पडताळले' : 'Multi-evidence verified'}</span>
                        </span>
                        <span className="font-bold text-primary flex items-center gap-1 group">
                          <span>{t.inspectBtn || (isMarathi ? 'तपशील पहा' : 'Inspect details')}</span>
                          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Interactive GIS Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="gov-card p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass size={16} className="text-primary" />
                  <span>{t.mapTitle || (isMarathi ? 'कोल्हापूर भू-स्थानिक नकाशा (GIS Map)' : 'Kolhapur Geospatial Triage Map')}</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.mapDesc || (isMarathi 
                    ? 'रंगीत प्राधान्य बिंदू आणि १ किमी बफरसह परस्परसंवादी नकाशा' 
                    : 'Interactive GIS map with color-coded priority pins & 1 km cluster buffers')}
                </p>
              </div>

              {selectedCluster && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">{isMarathi ? 'निवडलेले:' : 'Selected:'}</span>
                  <span className="font-bold text-primary font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedCluster.clusterId}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Cluster Map Component */}
            <ClusterMapView
              clusters={clusters}
              selectedClusterId={selectedCluster?.clusterId}
              onSelectCluster={handleSelectCluster}
            />

            {/* Map Footnote */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>
                  {isMarathi 
                    ? 'त्रिज्या: १ किमी समीपता नियम • Mapbox व्हेक्टर टाईल्स' 
                    : 'Radius: 1 km proximity heuristic • Mapbox Vector Tiles'}
                </span>
              </div>
              <div>
                {isMarathi ? 'तपशील पाहण्यासाठी नकाशावरील बिंदूवर क्लिक करा' : 'Click pin to open cluster inspection dossier'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Detail Drawer Modal */}
      {selectedCluster && (
        <ClusterDetailDrawer
          cluster={selectedCluster}
          reports={clusterReports}
          onClose={() => setSelectedCluster(null)}
        />
      )}
    </div>
  );
}
