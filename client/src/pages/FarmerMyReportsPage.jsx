import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  RefreshCw,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../api/config';

export default function FarmerMyReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language: lang, toggleLanguage, strings, isMarathi } = useLanguage();
  const t = strings;
  const mr = strings.myReports || {};

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/farmer/reports`);
      if (res.data?.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 
        (isMarathi ? 'अहवाल लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to load reports. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verification Completed':
        return {
          bg: 'bg-green-50 text-agri border-green-200',
          textMr: 'पडताळणी पूर्ण (Verification Completed)',
          textEn: 'Verification Completed'
        };
      case 'Field Verification':
        return {
          bg: 'bg-orange-50 text-priority-medium border-orange-200',
          textMr: 'क्षेत्रीय पंचनामा सुरू (Field Verification)',
          textEn: 'Field Verification in Progress'
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-50 text-priority-warning border-amber-200',
          textMr: 'तपासणी सुरू (Under Review)',
          textEn: 'Under Review'
        };
      case 'Report Submitted':
      default:
        return {
          bg: 'bg-blue-50 text-primary border-blue-200',
          textMr: 'अहवाल सादर (Report Submitted)',
          textEn: 'Report Submitted'
        };
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Header with Language Switcher and New Report Button */}
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
            {user?.name || 'Ram Patil'} • {user?.village || 'Shiroli'}
          </span>
          <h2 className="text-base font-bold text-content-main mt-0.5">
            {mr.title || (isMarathi ? 'माझे सादर केलेले नुकसान अहवाल' : 'My Submitted Damage Reports')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="farmer-tap-target px-2.5 py-1 bg-white hover:bg-page border border-border-default rounded text-xs font-semibold text-content-main flex items-center gap-1.5 transition-colors shadow-subtle"
            title="Switch Language / भाषा बदला"
          >
            <Languages size={14} className="text-primary" />
            <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
          </button>

          <button
            onClick={() => navigate('/farmer/report')}
            className="farmer-tap-target px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle size={14} />
            <span>{mr.newReportBtn || (isMarathi ? 'नवीन अहवाल' : 'New Report')}</span>
          </button>
        </div>
      </div>

      {/* Disclaimers: Isolation & Compensation */}
      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded text-xs text-content-secondary space-y-1">
        <div className="font-semibold text-content-main flex items-center gap-1.5">
          <AlertCircle size={13} className="text-primary" />
          <span>{isMarathi ? 'वैयक्तिक अहवाल नोंदवही (Personal Report Log)' : 'Personal Report Dossier (Isolated)'}</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {isMarathi
            ? 'येथे केवळ आपण सादर केलेले नुकसान अहवाल दिसतात. अधिकृत पंचनाम्यानंतर पडताळणीची स्थिती अद्ययावत केली जाते. (KrishiSakshi does not approve or reject compensation).'
            : 'Only your own registered reports are displayed here. Official status is updated following statutory field panchnama. (KrishiSakshi does not approve or reject compensation).'}
        </p>
      </div>

      {/* Report List */}
      {isLoading ? (
        <div className="gov-card p-8 text-center text-xs text-content-secondary">
          <RefreshCw size={18} className="animate-spin text-primary mx-auto mb-2" />
          <span>{isMarathi ? 'अहवाल लोड होत आहेत...' : 'Loading your reports...'}</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-priority-high text-center">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="gov-card p-8 text-center space-y-3">
          <FileText size={32} className="text-content-secondary mx-auto opacity-40" />
          <h4 className="text-sm font-bold text-content-main">
            {mr.emptyTitle || (isMarathi ? 'अद्याप कोणताही अहवाल नोंदवला नाही' : 'No Damage Reports Submitted Yet')}
          </h4>
          <p className="text-xs text-content-secondary">
            {mr.emptyDesc || (isMarathi ? 'आपल्या शेतातील पिकाचे नुकसान झाले असल्यास कृपया नुकसान अहवाल सादर करा.' : 'If your crops have suffered damage due to severe weather, submit an early report.')}
          </p>
          <button
            onClick={() => navigate('/farmer/report')}
            className="farmer-tap-target px-4 py-2 bg-agri text-white text-xs font-bold rounded-md shadow-sm"
          >
            {isMarathi ? 'पहिला अहवाल नोंदवा' : 'Submit First Report'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const badge = getStatusBadge(report.status);
            return (
              <div 
                key={report.caseId} 
                className="gov-card p-4 hover:border-primary transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    {report.caseId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.bg}`}>
                    {lang === 'mr' ? badge.textMr : (badge.textEn || report.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-content-secondary block text-[11px]">
                      {isMarathi ? 'पीक (Crop)' : 'Crop'}
                    </span>
                    <strong className="text-content-main font-semibold">
                      {t.crops?.[report.crop] || report.crop}
                    </strong>
                  </div>
                  <div>
                    <span className="text-content-secondary block text-[11px]">
                      {isMarathi ? 'नुकसान (Damage)' : 'Damage Type'}
                    </span>
                    <strong className="text-priority-high font-semibold">
                      {t.damages?.[report.damageType] || report.damageType}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-1 border-t border-gray-100 text-[11px] text-content-secondary gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin size={12} />
                    <span>{report.location.coordinates[1].toFixed(3)}°, {report.location.coordinates[0].toFixed(3)}°</span>
                  </span>
                  {report.isDemo && (
                    <span className="text-[10px] bg-amber-50 text-priority-warning border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                      {isMarathi ? 'डेमो नोंद' : 'Simulated Record'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
