import React from 'react';
import { CloudRain, AlertCircle, ArrowRight, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerAlertCard({ onReportClick }) {
  const { language, toggleLanguage, strings } = useLanguage();
  const t = strings;

  return (
    <div className="gov-card p-5 border-l-4 border-l-priority-high shadow-subtle bg-white relative overflow-hidden">
      {/* Top Bar: Language Toggle & Honest Demo Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-priority-warning border border-amber-200">
          <AlertCircle size={12} />
          <span>{t.demoAlertBadge || 'DEMO MODE — simulated alert'}</span>
        </span>

        {/* Language Switcher (मराठी | English) */}
        <button
          onClick={toggleLanguage}
          className="farmer-tap-target px-2.5 py-1 bg-page hover:bg-gray-100 border border-border-default rounded text-xs font-semibold text-content-main flex items-center gap-1.5 transition-colors"
          title="Switch Language / भाषा बदला"
        >
          <Languages size={14} className="text-primary" />
          <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
        </button>
      </div>

      {/* Alert Content */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 text-priority-high flex items-center justify-center shrink-0 mt-0.5">
          <CloudRain size={22} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-content-main leading-snug">
            {t.alertTitle}
          </h3>
          <p className="text-xs text-content-secondary mt-1 leading-relaxed">
            {t.alertMessage}
          </p>
        </div>
      </div>

      {/* Action Button: ≥ 44px tap target */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onReportClick}
          className="farmer-tap-target w-full sm:w-auto px-5 py-2.5 bg-priority-high hover:bg-red-800 text-white font-bold text-xs rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>{t.reportLossBtn}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
