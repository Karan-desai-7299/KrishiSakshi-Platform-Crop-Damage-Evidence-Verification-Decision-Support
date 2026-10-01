import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  CheckSquare, 
  CloudRain, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  FileText, 
  Users, 
  Cpu, 
  AlertTriangle,
  Lock,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAs, user } = useAuth();
  const { isMarathi } = useLanguage();

  const handleStartReport = async () => {
    await loginAs('FARMER');
    navigate('/farmer/report');
  };

  const handleViewMyReports = async () => {
    await loginAs('FARMER');
    navigate('/farmer/my-reports');
  };

  const handleEnterFarmerHome = async () => {
    await loginAs('FARMER');
    navigate('/farmer');
  };

  return (
    <div className="space-y-10 sm:space-y-12 max-w-5xl mx-auto pb-12">
      {/* 1. Hero Introduction */}
      <section className="text-center space-y-4 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isMarathi ? 'महाराष्ट्र शासन • सेवा फर्स्ट इनोव्हेशन चॅलेंज २०२६' : 'Govt of Maharashtra • Seva First Innovation 2026'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {isMarathi ? 'कृषीसाक्षी' : 'KrishiSakshi'}{' '}
          <span className="text-emerald-700 block sm:inline">
            {isMarathi ? '— लवकर नोंद, जलद पंचनामा' : '— Capture Early, Verify Faster'}
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          {isMarathi 
            ? 'अतिवृष्टी किंवा नैसर्गिक आपत्तीनंतरच्या ७२ तासांच्या काळात शेतकऱ्यांचे दावे, हवामान डेटा आणि उपग्रह पुरावे एकत्र आणून प्रत्यक्ष पंचनाम्याला गती देणारी साहाय्य प्रणाली.' 
            : 'An early evidence and coordination layer for the 72-hour window following extreme weather events, helping officials prioritize field Panchnama before evidence is lost.'}
        </p>
      </section>

      {/* 2. MAIN FARMER HERO ACTION CARD (Primary User Entrance) */}
      <section className="bg-white rounded-3xl border-2 border-emerald-600 shadow-xl overflow-hidden p-6 sm:p-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-bl-full opacity-50 -z-0 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 shrink-0">
                <Sprout size={32} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {isMarathi ? 'शेतकरी नागरिक पोर्टल' : 'Citizen Farmer Portal'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  {isMarathi ? 'पिकाचे नुकसान नोंदवा' : 'Report Crop Loss'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300">
                {isMarathi ? '⏱️ ७२ तासांत नुकसान नोंद आवश्यक' : '⏱️ 72-Hour Loss Window'}
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium max-w-3xl">
            {isMarathi 
              ? 'कोल्हापूर जिल्ह्यातील पूर किंवा अतिवृष्टीमुळे आपल्या शेतातील पिकाचे नुकसान झाले असल्यास, खालील बटणावर क्लिक करून ३ सोप्या पायऱ्यांत तात्काळ नोंद करा.' 
              : 'If your crops have suffered damage due to heavy rainfall or floods in Kolhapur district, submit your intimation within 72 hours via mobile in 3 simple steps.'}
          </p>

          {/* Simple 3 Farmer Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs font-semibold text-slate-700">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">✓</span>
              <span>{isMarathi ? '३ सोप्या पायऱ्यांत सोपी नोंदणी' : 'Quick 3-step submission'}</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">✓</span>
              <span>{isMarathi ? 'शेताचे GPS स्थान व फोटो जोडा' : 'GPS coordinates & optional photo'}</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">✓</span>
              <span>{isMarathi ? 'अधिकृत केस आयडी व स्थिती ट्रॅक करा' : 'Instant tracking Case ID'}</span>
            </div>
          </div>

          {/* Big Action Buttons for Farmer */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleStartReport}
              className="flex-1 py-4 px-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-base font-black flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/30 hover:shadow-emerald-700/50 transition-all group"
            >
              <span>{isMarathi ? '🚨 पिकाचे नुकसान नोंदवा' : '🚨 Report Crop Loss'}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleViewMyReports}
              className="py-4 px-6 bg-slate-100 hover:bg-emerald-50 border-2 border-slate-300 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FileText size={18} className="text-emerald-700" />
              <span>{isMarathi ? '📋 माझे आधीचे अहवाल तपासा' : '📋 Check My Reports'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 Simple Steps Timeline) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            {isMarathi ? 'कार्यप्रणाली' : 'How KrishiSakshi Works'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {isMarathi ? 'आपत्ती ते पंचनामा — ३ सोप्या टप्प्यांत' : 'From Disaster to Panchnama — 3 Simple Steps'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isMarathi ? 'अतिवृष्टीनंतर वेळेची बचत करून अचूक पंचनामा नियोजन' : 'Saving critical time after disaster for transparent verification'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center border border-sky-300">
                १
              </span>
              <CloudRain size={20} className="text-sky-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {isMarathi ? '१. अतिवृष्टी इशारा' : '1. Weather Trigger'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isMarathi 
                ? 'स्थानिक परिसरात १०० मिमी पावसाची मर्यादा ओलांडताच आपत्ती नोंदवली जाते व शेतकऱ्यांना अलर्ट मिळतो.' 
                : 'When cumulative rainfall exceeds 100mm threshold, an event flag is logged and farmers receive an alert.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-300">
                २
              </span>
              <Sprout size={20} className="text-emerald-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {isMarathi ? '२. शेतकरी नोंद' : '2. Farmer Intimation'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isMarathi 
                ? 'शेतकरी ७२ तासांच्या आत मोबाईलवरून पीक व नुकसानीचा प्रकार नोंदवून अधिकृत केस आयडी प्राप्त करतात.' 
                : 'Farmers submit early loss intimation within 72 hours via mobile and receive an official tracking Case ID.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center border border-blue-300">
                ३
              </span>
              <CheckSquare size={20} className="text-blue-700" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {isMarathi ? '३. शासकीय पंचनामा' : '3. Field Panchnama'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isMarathi 
                ? 'कृषी अधिकारी प्राधान्य यादीनुसार सर्वाधिक नुकसानग्रस्त गावांत वेगाने जाऊन अधिकृत पंचनामा पूर्ण करतात.' 
                : 'Officials triage verification visits by multi-evidence clusters and conduct statutory field Panchnama.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. PUBLIC WEATHER MONITOR STRIP */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/30">
            <CloudRain size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-sky-300 tracking-wider">
              {isMarathi ? 'सार्वजनिक आपत्ती व हवामान डेटा' : 'Public Disaster & Weather Data'}
            </div>
            <div className="text-sm font-bold text-slate-100">
              {isMarathi ? 'कोल्हापूर जिल्हा अतिवृष्टी पुनर्विश्लेषण (Open-Meteo ERA5)' : 'Kolhapur District Monsoon Reanalysis (Open-Meteo ERA5)'}
            </div>
          </div>
        </div>

        <Link
          to="/event-monitor"
          className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow"
        >
          <span>{isMarathi ? '🌧️ हवामान डेटा पहा' : '🌧️ View Weather Events'}</span>
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* 5. SEPARATE OFFICIAL GOVERNMENT SECTION (Dedicated for Agriculture & Revenue Officers) */}
      <section className="bg-slate-50 border border-slate-300 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <Building2 size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                {isMarathi ? 'विभागीय अधिकारी कक्ष' : 'Departmental Staff Only'}
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900">
              {isMarathi ? 'तालुका कृषी व महसूल अधिकारी नियंत्रण कक्ष' : 'Official Verification & Triage Command Desk'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {isMarathi 
                ? 'तालुका कृषी अधिकारी व महसूल कर्मचाऱ्यांसाठी प्राधान्यक्रम यादी, क्लस्टर नकाशे आणि क्षेत्रीय पंचनामा नोंद व्यवस्था.' 
                : 'For Taluka Agriculture Officers and Revenue staff: Review ranked clusters, evidence fusion, and log statutory on-ground Panchnama.'}
            </p>
          </div>
        </div>

        <Link
          to="/officer/login"
          className="w-full sm:w-auto px-5 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <Lock size={15} />
          <span>{isMarathi ? 'शासकीय अधिकारी लॉगिन' : 'Officer Login'}</span>
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* 6. TRANSPARENCY & STATUTORY BOUNDARY */}
      <div className="p-4 bg-gray-50 border border-border-default rounded-xl text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>{isMarathi ? 'पारदर्शक शासकीय समन्वय मर्यादा (Statutory Decision Support Boundary)' : 'Statutory Decision Support Boundary'}</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {isMarathi 
            ? 'कृषीसाक्षी ही प्रणाली अतिवृष्टीच्या काळात पुरावे संकलित करून प्रत्यक्ष पंचनाम्याला साहाय्य करते. ही प्रणाली भरपाई मंजूर करत नाही किंवा अधिकृत क्षेत्रीय पंचनाम्याची जागा घेत नाही.' 
            : 'KrishiSakshi is an evidence and coordination layer for the 72-hour window following extreme weather events. It does NOT approve compensation and does NOT replace statutory physical Panchnama.'}
        </p>
      </div>
    </div>
  );
}
