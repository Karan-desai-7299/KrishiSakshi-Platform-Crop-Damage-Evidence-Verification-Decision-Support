import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, FileText, ArrowRight, ShieldCheck, MapPin, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import FarmerAlertCard from '../components/FarmerAlertCard';

export default function FarmerHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMarathi, strings } = useLanguage();
  const f = strings.farmer || {};

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-20">
      {/* Active Weather Alert Card (Screen 2 Headline) */}
      <FarmerAlertCard onReportClick={() => navigate('/farmer/report')} />

      {/* Farmer Profile & Farm Overview Card */}
      <div className="gov-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border-default pb-2">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-agri" />
            <h3 className="text-xs font-bold text-content-main uppercase tracking-wider">
              {f.profileTitle || (isMarathi ? 'शेतकरी खाते तपशील' : 'Farmer Profile')}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-agri bg-agri-light px-2 py-0.5 rounded border border-[#C8E6C9]">
            {f.ePikRegistered || 'e-Pik Pahani Registered'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-content-secondary text-[11px] block">
              {f.farmerName || (isMarathi ? 'शेतकऱ्याचे नाव' : 'Farmer Name')}
            </span>
            <strong className="text-content-main font-semibold">{user?.name || 'Ram Patil'}</strong>
          </div>
          <div>
            <span className="text-content-secondary text-[11px] block">
              {f.villageTaluka || (isMarathi ? 'गाव / तालुका' : 'Village / Taluka')}
            </span>
            <strong className="text-content-main font-semibold">{user?.village || 'Shiroli'}, {user?.district || 'Kolhapur'}</strong>
          </div>
          <div>
            <span className="text-content-secondary text-[11px] block">
              {f.registeredCrop || (isMarathi ? 'नोंदणीकृत पीक' : 'Registered Crop')}
            </span>
            <strong className="text-content-main font-semibold">
              {isMarathi ? 'सोयाबीन (Soybean) • ३.५ एकर' : 'Soybean • 3.5 Acres'}
            </strong>
          </div>
          <div>
            <span className="text-content-secondary text-[11px] block">
              {f.phone || (isMarathi ? 'मोबाइल क्रमांक' : 'Phone')}
            </span>
            <span className="font-mono text-content-main">{user?.phone || '99999XXXXX'}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/farmer/report')}
          className="farmer-tap-target p-4 bg-white hover:border-primary border border-border-default rounded-card shadow-subtle text-left space-y-1.5 transition-all group"
        >
          <div className="w-8 h-8 rounded bg-red-100 text-priority-high flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sprout size={18} />
          </div>
          <div className="text-xs font-bold text-content-main">
            {f.quickReportTitle || (isMarathi ? 'पिकाचे नुकसान नोंदवा' : 'Report Crop Loss')}
          </div>
          <div className="text-[10px] text-content-secondary leading-tight">
            {f.quickReportDesc || (isMarathi ? '३ सोप्या पायऱ्यांत नुकसानीचा प्राथमिक अहवाल पाठवा' : 'Submit early damage report in 3 simple steps')}
          </div>
        </button>

        <button
          onClick={() => navigate('/farmer/my-reports')}
          className="farmer-tap-target p-4 bg-white hover:border-primary border border-border-default rounded-card shadow-subtle text-left space-y-1.5 transition-all group"
        >
          <div className="w-8 h-8 rounded bg-blue-100 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText size={18} />
          </div>
          <div className="text-xs font-bold text-content-main">
            {f.quickMyReportsTitle || (isMarathi ? 'माझे अहवाल तपासा' : 'Check My Reports')}
          </div>
          <div className="text-[10px] text-content-secondary leading-tight">
            {f.quickMyReportsDesc || (isMarathi ? 'सादर केलेले अहवाल व पडताळणी स्थिती' : 'View submitted reports and verification status')}
          </div>
        </button>
      </div>

      {/* System Relationship Disclosure */}
      <div className="p-3 bg-gray-50 border border-border-default rounded text-[11px] text-content-secondary leading-relaxed">
        <span className="font-semibold text-content-main">{isMarathi ? 'माहिती: ' : 'Notice: '}</span>
        <span>
          {f.disclosure || (isMarathi 
            ? 'कृषीसाक्षी ही प्रणाली आपत्तीनंतर तातडीने नुकसानीची माहिती नोंदवण्यासाठी आहे. ही प्रणाली ई-पीक पाहणी किंवा प्रत्यक्ष पंचनामा प्रक्रियेची जागा घेत नाही.'
            : 'KrishiSakshi is an evidence capture and coordination tool for the period immediately following an extreme event. It does NOT replace e-Pik Pahani or official physical Panchnama.')}
        </span>
      </div>
    </div>
  );
}
