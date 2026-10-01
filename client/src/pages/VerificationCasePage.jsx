import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  MapPin, 
  CloudRain, 
  Layers, 
  Users, 
  CheckSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Camera, 
  FileText, 
  Send, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Info,
  Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../api/config';

export default function VerificationCasePage() {
  const { caseId } = useParams();
  const { user, loginAsRole } = useAuth();
  const { language, strings, isMarathi } = useLanguage();
  const t = strings.verification || {};
  const tc = strings.common || {};

  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Verification form state
  const [finding, setFinding] = useState('Verified');
  const [observedLossPercent, setObservedLossPercent] = useState(70);
  const [officerNotes, setOfficerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch full case dossier
  const loadDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('krishi_demo_token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/reports/${caseId}/dossier`, {
        headers: authHeader
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDossier(data.data);
        if (data.data.verification) {
          setFinding(data.data.verification.status || 'Verified');
          setOfficerNotes(data.data.verification.notes || '');
          if (data.data.verification.observedLossPercent !== undefined) {
            setObservedLossPercent(data.data.verification.observedLossPercent);
          }
        } else if (data.data.report?.estimatedLossPercent) {
          setObservedLossPercent(data.data.report.estimatedLossPercent);
        }
      } else {
        setError(data.error?.message || `Failed to load case dossier for ${caseId}`);
      }
    } catch (err) {
      console.error('Error fetching dossier:', err);
      setError('Network error while retrieving case dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [caseId, user]);

  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit official verification panchnama finding
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('krishi_demo_token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/reports/${caseId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({
          finding,
          observedLossPercent: Number(observedLossPercent),
          notes: officerNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        loadDossier(); // Refresh dossier and audit timeline
      } else {
        setSubmitError(data.error?.message || 'Failed to submit verification observation.');
      }
    } catch (err) {
      console.error('Submit verification error:', err);
      setSubmitError('Network error while recording verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="gov-card p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-sm font-semibold text-content-main">
          {isMarathi ? `प्रकरण दस्तऐवज लोड होत आहे ${caseId}...` : `Loading Case Dossier ${caseId}...`}
        </div>
        <div className="text-xs text-content-secondary">
          {isMarathi ? 'विविध पुरावे व तपासणी नोंदी संकलित करत आहे...' : 'Aggregating multi-source evidence and audit logs...'}
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="gov-card p-8 border-l-4 border-l-priority-high space-y-4">
        <div className="flex items-center gap-2 text-priority-high font-bold">
          <AlertCircle size={20} />
          <span>{isMarathi ? 'प्रकरण लोड करताना त्रुटी आली' : 'Error Loading Case'}</span>
        </div>
        <p className="text-xs text-content-secondary">{error || (isMarathi ? 'प्रकरण सापडले नाही' : 'Case not found')}</p>
        <Link
          to="/officer"
          className="farmer-tap-target inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>{isMarathi ? 'अधिकारी डॅशबोर्डवर परत जा' : 'Return to Officer Dashboard'}</span>
        </Link>
      </div>
    );
  }

  const { report, weather, satellite, cluster, verification, auditLogs } = dossier;
  const farmer = report.farmerId || {};

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-content-secondary">
          <Link to="/officer" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>{isMarathi ? 'अधिकारी डॅशबोर्ड' : 'Officer Dashboard'}</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-content-main">{caseId}</span>
        </div>

        <div className="flex items-center gap-2">
          {user?.role !== 'OFFICER' && (
            <button
              onClick={() => loginAsRole('OFFICER')}
              className="farmer-tap-target px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition-colors shadow-sm"
            >
              {isMarathi ? 'अधिकारी खात्यावर स्विच करा' : 'Switch to Officer Sanjay Deshmukh'}
            </button>
          )}
          <button
            onClick={handleCopyCaseId}
            className="farmer-tap-target px-2.5 py-1 bg-white hover:bg-gray-100 text-content-secondary border border-border-default rounded text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Copy size={12} />
            <span>{copied ? (isMarathi ? 'कॉपी झाले!' : 'Copied!') : (isMarathi ? 'आयडी कॉपी करा' : 'Copy ID')}</span>
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="gov-card p-4 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {isMarathi ? 'क्षेत्रीय पंचनामा पडताळणी डॉक्युमेंट' : 'Field Panchnama Verification Dossier'}
            </span>
            <span className="text-xs text-content-secondary">
              {t.screenLabel || (isMarathi ? 'स्क्रीन ५ • प्रत्यक्ष पडताळणी व अधिकृत नोंद' : 'Screen 5: Case Verification & Audit')}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-content-main font-mono">{caseId}</h2>
            <span className="text-xs text-content-secondary font-medium">
              • {farmer.village || 'Shiroli'}, {farmer.district || 'Kolhapur'}
            </span>
          </div>
          <div className="text-xs text-content-secondary mt-0.5">
            {isMarathi ? 'सादरकर्ता:' : 'Submitted by'} <strong className="text-content-main">{farmer.name || 'Ram Patil'}</strong> • {isMarathi ? 'शेतकरी फोन:' : 'Farmer Phone:'} <span className="font-mono">{farmer.phone || '99999XXXXX'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`px-3 py-1.5 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
            report.status === 'Verification Completed'
              ? 'bg-green-50 text-agri border-[#C8E6C9]'
              : report.status === 'Field Verification'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>
              {report.status === 'Verification Completed'
                ? (isMarathi ? 'पडताळणी पूर्ण (Verified)' : 'Verification Completed')
                : report.status === 'Field Verification'
                  ? (isMarathi ? 'क्षेत्रीय पडताळणी सुरू' : 'Field Verification')
                  : (isMarathi ? 'तपासणी सुरू आहे' : report.status)}
            </span>
          </span>
        </div>
      </div>

      {/* Honesty & Decision Support Notice */}
      <div className="gov-card p-3 bg-blue-50/40 border-border-default text-xs flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-content-main">{isMarathi ? 'निर्णय सहाय्य मार्गदर्शक तत्त्व: ' : 'Decision Support Heuristic: '}</strong>
          <span className="text-content-secondary">
            {isMarathi
              ? 'हे दस्तऐवज क्षेत्रीय अधिकाऱ्यांना प्रत्यक्ष पंचनाम्यासाठी पूर्व-तयारी करण्यास मदत करण्यासाठी पुरावे संकलित करते. कृषीसाक्षी कोणतीही भरपाई मंजूर करत नाही किंवा वैधानिक पंचनाम्याची जागा घेत नाही.'
              : 'This dossier synthesizes pre-collected evidence to assist field officers in preparing for physical panchnama. KrishiSakshi does not calculate or approve compensation amounts, nor replace statutory verification.'}
          </span>
        </div>
      </div>

      {/* The 4 Structured Evidence Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Farmer Submission */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <Sprout size={14} className="text-agri" />
              <span>{t.cardFarmer || (isMarathi ? '१. शेतकऱ्याचा प्राथमिक दावा' : '1. Farmer Submission Record')}</span>
            </h3>
            <span className="text-[10px] text-content-secondary font-mono">
              {isMarathi ? 'घटना संलग्न' : 'Replay Linked'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'पीक व अवस्था:' : 'Crop & Stage:'}</span>
              <div className="font-bold text-content-main">
                {strings.crops?.[report.crop] || report.crop} {isMarathi ? '(शाकीय वाढ अवस्था)' : '(Vegetative)'}
              </div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'नोंदवलेले नुकसान:' : 'Reported Loss:'}</span>
              <div className="font-bold text-priority-high">{report.estimatedLossPercent || 70}% {isMarathi ? 'नुकसान दावा' : 'loss claimed'}</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'नुकसानीचे कारण:' : 'Damage Type:'}</span>
              <div className="font-semibold text-content-main">
                {strings.damages?.[report.damageType] || report.damageType}
              </div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'नोंदणी वेळ:' : 'Reported Time:'}</span>
              <div className="font-mono text-[11px] text-content-main">
                {new Date(report.effectiveReportedAt || report.reportedAt).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                <span className="text-[9px] text-primary ml-1">({isMarathi ? 'घटना वेळ' : 'replay time'})</span>
              </div>
            </div>
          </div>

          {/* Location & Photo */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-content-secondary">
              <MapPin size={13} className="text-primary" />
              <span className="font-mono text-[11px]">
                [{report.location?.coordinates[0]?.toFixed(4)}, {report.location?.coordinates[1]?.toFixed(4)}]
              </span>
            </div>
            <span className="text-[10px] text-agri font-semibold">
              {isMarathi ? 'GPS पडताळणी (अचूकता ~१० मी)' : 'GPS Verified (Accuracy ~10m)'}
            </span>
          </div>

          {report.photo?.url ? (
            <div className="mt-2 rounded overflow-hidden border border-border-default max-h-36">
              <img src={report.photo.url} alt="Crop damage evidence" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="p-2.5 rounded bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-content-secondary">
              {isMarathi ? 'शेतकऱ्याने फोटोशिवाय अहवाल सादर केला आहे (ऐच्छिक नोंद).' : 'Farmer submitted without field photo (optional submission).'}
            </div>
          )}
        </div>

        {/* Section 2: Weather Context */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <CloudRain size={14} className="text-primary" />
              <span>{t.cardWeather || (isMarathi ? '२. हवामान पुनर्गणना पुरावा' : '2. Weather Context (Gridded Reanalysis)')}</span>
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-primary border border-blue-200">
              Open-Meteo Archive
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'घटना कालावधी:' : 'Event Period:'}</span>
              <div className="font-medium text-content-main">{weather.startDate} to {weather.endDate}</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'संदर्भ केंद्र:' : 'Reference Station:'}</span>
              <div className="font-medium text-content-main">{weather.referenceStation}</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'एकूण पाऊस:' : 'Cumulative Rainfall:'}</span>
              <div className="font-bold text-primary text-sm">{weather.cumulativeRainfallMm} mm</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'मर्यादा स्थिती:' : 'Threshold Status:'}</span>
              <div className="font-bold text-priority-high flex items-center gap-1">
                <span>▲ {isMarathi ? `मर्यादा ओलांडली (${weather.thresholdMm} मिमी)` : `Exceeded (${weather.thresholdMm} mm)`}</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-gray-50 border border-border-default text-[11px] text-content-secondary space-y-1">
            <div className="font-semibold text-content-main">{isMarathi ? 'वातावरणीय निष्कर्ष:' : 'Atmospheric Assessment:'}</div>
            <div>
              {isMarathi 
                ? '५ दिवसांच्या कालावधीत स्थानिक पर्जन्यमान १०० मिमीच्या आपत्ती मर्यादेपेक्षा जास्त नोंदवले गेले आहे.' 
                : 'Cumulative precipitation exceeded the monsoon trigger threshold of 100 mm during the 5-day event window.'}
            </div>
            <div className="text-[10px] text-gray-400 italic pt-1 border-t border-gray-200">
              {isMarathi
                ? '* टीप: हवामान पुनर्गणना ग्रिड ९-२५ किमी व्याप्तीचे आहे; ही मूल्ये वातावरणीय अंदाज दर्शवतात, वैयक्तिक शेतातील रेन-गेज नव्हे.'
                : '* Caveat: Reanalysis grid resolution is ~9–25 km; values represent gridded atmospheric estimates, not an individual farm rain-gauge.'}
            </div>
          </div>
        </div>

        {/* Section 3: Satellite Layer (Simulated Proxy) */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-primary" />
              <span>{t.cardSatellite || (isMarathi ? '३. उपग्रह बदल प्रात्यक्षिक' : '3. Satellite SAR Proxy')}</span>
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-priority-warning border border-amber-200 uppercase">
              {satellite.badge || 'SIMULATED — prototype only'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'प्रातिनिधिक संकेत:' : 'Proxy Signal:'}</span>
              <div className="font-bold text-content-main">{satellite.signal}</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'विश्वासार्हता:' : 'Confidence Level:'}</span>
              <div className="font-semibold text-agri">{satellite.confidence || (isMarathi ? 'मध्यम' : 'Moderate')}</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'सिंथेटिक प्लॅटफॉर्म:' : 'Synthetic Platform:'}</span>
              <div className="font-mono text-[11px] text-content-main">{satellite.platform || 'Sentinel-1 SAR'}</div>
            </div>
            <div>
              <span className="text-content-secondary text-[11px]">{isMarathi ? 'ध्रुवीकरण (Polarization):' : 'Polarization:'}</span>
              <div className="font-mono text-[11px] text-content-main">{satellite.polarization || 'VV/VH Coherence'}</div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-amber-50/40 border border-amber-200/60 text-[11px] text-content-secondary space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <Info size={12} />
              <span>{isMarathi ? 'पारदर्शकता टीप:' : 'Simulation Transparency Note:'}</span>
            </div>
            <div>
              {isMarathi
                ? 'हा थर केवळ प्रात्यक्षिक प्रातिनिधिक (proxy) आहे. प्रत्यक्ष उपग्रह रडार पृथक्करण पायलट टप्प्यानंतर जोडले जाईल.'
                : (satellite.notice || 'This layer is a simulated demonstration proxy. Real satellite coherence analysis is scheduled for post-pilot integration.')}
            </div>
          </div>
        </div>

        {/* Section 4: Cluster Context */}
        <div className="gov-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h3 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-primary" />
              <span>{t.cardCluster || (isMarathi ? '४. परिसरातील नुकसान क्षेत्र संदर्भ' : '4. Spatial Cluster Context')}</span>
            </h3>
            {cluster ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-primary border border-blue-200 font-mono">
                {cluster.clusterId}
              </span>
            ) : (
              <span className="text-[10px] text-content-secondary">{isMarathi ? 'स्वतंत्र अहवाल' : 'Unclustered'}</span>
            )}
          </div>

          {cluster ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-content-secondary text-[11px]">{isMarathi ? 'गट प्राधान्य:' : 'Cluster Priority:'}</span>
                  <div className="font-bold text-priority-high">
                    {isMarathi && cluster.priorityLevel === 'High' ? 'उच्च (High)' : isMarathi && cluster.priorityLevel === 'Medium' ? 'मध्यम (Medium)' : cluster.priorityLevel} ({isMarathi ? 'गुण:' : 'Score:'} {cluster.priorityScore}/100)
                  </div>
                </div>
                <div>
                  <span className="text-content-secondary text-[11px]">{isMarathi ? 'अहवाल घनता:' : 'Cluster Density:'}</span>
                  <div className="font-bold text-content-main">
                    {cluster.reportCount} {isMarathi ? 'अहवाल १ किमी परिघात' : 'reports within 1 km'}
                  </div>
                </div>
                <div>
                  <span className="text-content-secondary text-[11px]">{isMarathi ? 'मध्यबिंदूपासून अंतर:' : 'Farm Distance to Centroid:'}</span>
                  <div className="font-bold text-content-main">{cluster.distanceFromCentroidMeters} {isMarathi ? 'मीटर' : 'meters'}</div>
                </div>
                <div>
                  <span className="text-content-secondary text-[11px]">{isMarathi ? 'प्रमुख नुकसान प्रकार:' : 'Dominant Damage Type:'}</span>
                  <div className="font-semibold text-content-main">
                    {strings.damages?.[cluster.dominantDamageType] || cluster.dominantDamageType || (isMarathi ? 'पाणी साचणे' : 'Waterlogging')}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs space-y-1">
                <span className="text-[11px] font-bold text-content-main">
                  {isMarathi ? 'पुरावा तपासणी सूची (WHY):' : 'Cluster Evidence Checklist:'}
                </span>
                {cluster.reasons?.slice(0, 3).map((r, i) => (
                  <div key={i} className="text-[11px] text-content-secondary flex items-start gap-1.5">
                    <span className="text-agri font-bold">✓</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-xs text-content-secondary">
              {isMarathi 
                ? 'हा अहवाल कोणत्याही बहु-अहवाल गटाचा भाग नाही (स्वतंत्र नोंद).' 
                : 'This report is not part of a multi-report cluster (isolated submission).'}
            </div>
          )}
        </div>
      </div>

      {/* Field Panchnama Verification Action Card (Officer Only) */}
      <div className="gov-card p-6 border-l-4 border-l-agri space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default pb-3">
          <div>
            <h3 className="text-sm font-bold text-content-main flex items-center gap-2">
              <CheckSquare size={16} className="text-agri" />
              <span>{t.officerFormTitle || (isMarathi ? 'अधिकृत क्षेत्रीय पंचनामा निरीक्षण नोंदवा' : 'Official Field Panchnama Recording')}</span>
            </h3>
            <p className="text-xs text-content-secondary mt-0.5">
              {isMarathi 
                ? 'शेतातील प्रत्यक्ष पाहणी नोंदी जतन करा. यामुळे कायमस्वरूपी अधिकृत तपासणी कालरेषा (audit log) तयार होते.' 
                : 'Record physical on-site observations. This creates an official, immutable audit log entry.'}
            </p>
          </div>
          <div className="text-xs text-content-secondary">
            {isMarathi ? 'अधिकृत तपासणी अधिकारी:' : 'Official Officer:'} <strong className="text-content-main">{user?.name || 'Sanjay Deshmukh'}</strong> ({user?.role || 'OFFICER'})
          </div>
        </div>

        {submitSuccess && (
          <div className="p-3 rounded-md bg-green-50 border border-[#C8E6C9] text-xs text-agri font-semibold flex items-center gap-2">
            <CheckCircle size={16} />
            <span>
              {isMarathi 
                ? 'अधिकृत क्षेत्रीय पंचनामा निरीक्षण प्रकरणात यशस्वीरीत्या नोंदवले गेले!' 
                : 'Official field panchnama observation recorded successfully into case record!'}
            </span>
          </div>
        )}

        {submitError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-priority-high font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitVerification} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Finding Decision */}
            <div>
              <label className="block text-xs font-bold text-content-main mb-1.5">
                {t.findingLabel || (isMarathi ? 'पंचनामा निष्कर्ष (Official Finding):' : 'Physical Panchnama Finding')} <span className="text-priority-high">*</span>
              </label>
              <select
                value={finding}
                onChange={(e) => setFinding(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border-default bg-[#F7F9FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Verified">
                  {isMarathi ? 'नुकसान प्रमाणित (Verified - प्रत्यक्ष नुकसान अहवालाशी जुळते)' : 'Verified (Physical damage observed matches report)'}
                </option>
                <option value="Partially Verified">
                  {isMarathi ? 'अंशतः प्रमाणित (Partially Verified - नुकसानीच्या प्रमाणात तफावत)' : 'Partially Verified (Observed damage differs in extent)'}
                </option>
                <option value="Needs More Information">
                  {isMarathi ? 'अधिक माहिती आवश्यक (Needs More Information - ७/१२ फेरसर्वेक्षण)' : 'Needs More Information (Requires 7/12 land record re-survey)'}
                </option>
                <option value="Not Observed">
                  {isMarathi ? 'नुकसान आढळले नाही (Not Observed - शेतावर नुकसान नाही)' : 'Not Observed (No crop damage visible on-ground)'}
                </option>
              </select>
            </div>

            {/* Observed Loss % */}
            <div>
              <label className="block text-xs font-bold text-content-main mb-1.5">
                {t.lossPercentLabel || (isMarathi ? 'प्रत्यक्ष पाहणीनुसार नुकसान टक्केवारी (%):' : 'Observed Crop Loss (%) — Field Assessment')} <span className="text-priority-high">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={observedLossPercent}
                  onChange={(e) => setObservedLossPercent(e.target.value)}
                  className="flex-1 accent-primary"
                />
                <span className="font-mono font-bold text-sm text-primary w-12 text-right">
                  {observedLossPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Field Notes */}
          <div>
            <label className="block text-xs font-bold text-content-main mb-1.5">
              {t.notesLabel || (isMarathi ? 'अधिकृत पंचनामा टिप्पणी व स्वाक्षरी तपशील:' : 'Field Officer Panchnama Notes & Sign-off Details')} <span className="text-priority-high">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder={t.notesPlaceholder || (isMarathi ? 'उदा. गट क्र. ४२ ची प्रत्यक्ष पाहणी केली असता कंबरेइतके पाणी साचल्याने ऊस/सोयाबीन पिकाचे ६५% नुकसान प्रमाणित करण्यात येत आहे...' : 'e.g., Inspected survey plot #42. Sugarcane crop submerged under 2 feet of water. Roots exhibiting rot symptoms. Recommended for standard relief queue...')}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-border-default bg-[#F7F9FA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-content-secondary">
              {isMarathi 
                ? 'टीप: पडताळणी स्थिती अद्यतनित केल्यानंतर शेतकऱ्यास तात्काळ एसएमएसद्वारे (सिम्युलेटेड) सूचना पाठवली जाते.' 
                : 'Note: Updating verification status will notify the farmer via simulated SMS update.'}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="farmer-tap-target px-5 py-2 bg-agri hover:bg-green-800 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckSquare size={15} />
              <span>
                {submitting 
                  ? (isMarathi ? 'नोंद होत आहे...' : 'Recording Panchnama...') 
                  : (t.submitFindingBtn || (isMarathi ? 'अधिकृत पंचनामा नोंद जतन करा' : 'Submit Official Panchnama Record'))}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Immutable Audit Log Timeline */}
      <div className="gov-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border-default pb-2">
          <h3 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={14} className="text-primary" />
            <span>{t.auditTitle || (isMarathi ? 'कायमस्वरूपी तपासणी कालरेषा (Audit Trail)' : 'Immutable Case Audit Log Timeline')}</span>
          </h3>
          <span className="text-[10px] text-content-secondary font-mono">
            {auditLogs?.length || 0} {isMarathi ? 'नोंदी सुरक्षित' : 'events recorded'}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {auditLogs && auditLogs.length > 0 ? (
            auditLogs.map((log, idx) => (
              <div key={log.id || idx} className="flex items-start gap-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0" />
                <div className="flex-1 p-2 rounded bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-content-main font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-content-secondary font-mono">
                      {new Date(log.createdAt).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-content-secondary mt-0.5">
                    {isMarathi ? 'कर्ता:' : 'Actor:'} <strong className="text-content-main">{log.actor?.name || 'System'}</strong> ({log.actor?.role || 'SYSTEM'})
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-1 text-[10px] text-gray-500 font-mono bg-white p-1 rounded border border-gray-200">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-content-secondary italic">
              {isMarathi ? 'अद्याप कोणत्याही नोंदी नाहीत.' : 'No audit records logged yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
