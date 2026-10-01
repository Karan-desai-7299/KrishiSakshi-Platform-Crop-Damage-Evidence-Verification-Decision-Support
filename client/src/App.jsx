import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Database, 
  MapPin, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Server,
  CloudRain,
  Sprout,
  Activity,
  ArrowRight,
  Users,
  FileText,
  CheckSquare,
  Cpu,
  Globe,
  ChevronDown,
  Lock,
  UserCheck
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import HonestyBanner from './components/HonestyBanner';
import EventMonitorPage from './pages/EventMonitorPage';
import FarmerLayout from './layouts/FarmerLayout';
import FarmerHomePage from './pages/FarmerHomePage';
import FarmerReportFlow from './pages/FarmerReportFlow';
import FarmerMyReportsPage from './pages/FarmerMyReportsPage';
import IntelligencePage from './pages/IntelligencePage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import OfficerLoginPage from './pages/OfficerLoginPage';
import VerificationCasePage from './pages/VerificationCasePage';
import LandingPage from './pages/LandingPage';

function LanguageSwitcher() {
  const { language, setLanguage, isMarathi } = useLanguage();

  return (
    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-300 text-xs font-bold shadow-inner">
      <button
        onClick={() => setLanguage('mr')}
        className={`px-3 py-1 rounded-md transition-all ${
          isMarathi
            ? 'bg-emerald-700 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="मराठी भाषेत वापरा"
      >
        मराठी
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md transition-all ${
          !isMarathi
            ? 'bg-blue-800 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to English"
      >
        English
      </button>
    </div>
  );
}

// Route Guard: Ensures only authenticated Agriculture/Revenue Officers can access Triage tools
function OfficerProtectedRoute({ children }) {
  const { user, isOfficer } = useAuth();
  const { isMarathi } = useLanguage();

  if (!user) {
    return <Navigate to="/officer/login" replace />;
  }

  if (user.role !== 'OFFICER') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border-2 border-amber-400 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-black text-slate-900">
          {isMarathi ? 'प्रवेश केवळ कृषी अधिकाऱ्यांसाठी राखीव' : 'Restricted to Agriculture Officers'}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {isMarathi 
            ? 'हा नियंत्रण कक्ष केवळ अधिकृत तालुका कृषी अधिकारी व महसूल कर्मचाऱ्यांसाठी आहे. शेतकरी खात्यावरून येथे प्रवेश करता येत नाही.' 
            : 'This command desk is strictly restricted to authorized agriculture and revenue officers. Farmer accounts cannot access triage tools.'}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center text-xs">
          <Link 
            to="/farmer" 
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
          >
            {isMarathi ? '🌾 शेतकरी कक्षात परत जा' : 'Back to Farmer Portal'}
          </Link>
          <Link 
            to="/officer/login" 
            className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold shadow-md"
          >
            {isMarathi ? '🏛️ अधिकारी लॉगिन' : 'Officer Login'}
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

function RoleAwareHeader() {
  const location = useLocation();
  const { isMarathi } = useLanguage();
  const { user, loginAs, logout } = useAuth();

  const isOfficerLogin = location.pathname === '/officer/login';
  const isHome = location.pathname === '/';
  const isFarmer = location.pathname.startsWith('/farmer');
  const isOfficer = !isOfficerLogin && (location.pathname.startsWith('/officer') || location.pathname.startsWith('/intelligence') || location.pathname.startsWith('/verification'));
  const isWeather = location.pathname.startsWith('/event-monitor');

  // 1. LANDING & OFFICER LOGIN HEADER: Clean, public-facing
  if (isHome || isOfficerLogin) {
    return (
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform shrink-0">
              <Sprout size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isMarathi ? 'महाराष्ट्र शासन • कृषी विभाग' : 'Govt of Maharashtra • Agriculture Dept'}
              </span>
              <div className="text-lg font-black text-slate-900 leading-none mt-1">
                {isMarathi ? 'कृषीसाक्षी' : 'KrishiSakshi'}{' '}
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  — {isMarathi ? 'पिकाचे नुकसान लवकर नोंदवा, जलद पडताळणी' : 'Capture early, verify faster'}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            {user?.role === 'OFFICER' ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 hidden sm:inline">
                  👮 {user.name} ({isMarathi ? 'अधिकारी' : 'Officer'})
                </span>
                <Link to="/officer" className="px-3 py-1.5 bg-blue-800 text-white rounded-lg font-bold shadow-sm hover:bg-blue-900">
                  {isMarathi ? 'डॅशबोर्ड' : 'Dashboard'}
                </Link>
                <button onClick={logout} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">
                  {isMarathi ? 'लॉगआउट' : 'Logout'}
                </button>
              </div>
            ) : user?.role === 'FARMER' ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 hidden sm:inline">
                  🌾 {user.name} ({isMarathi ? 'शेतकरी' : 'Farmer'})
                </span>
                <Link to="/farmer" className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-800">
                  {isMarathi ? 'शेतकरी कक्ष' : 'Farmer Portal'}
                </Link>
                <button onClick={logout} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">
                  {isMarathi ? 'लॉगआउट' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link
                to="/officer/login"
                className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                title="Official Agriculture Dept Login"
              >
                <Lock size={13} className="text-blue-700" />
                <span>{isMarathi ? 'शासकीय अधिकारी लॉगिन' : 'Officer Login'}</span>
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    );
  }

  // 2. FARMER PORTAL HEADER: Emerald green, 100% farmer-isolated (NO OFFICER BUTTONS)
  if (isFarmer) {
    return (
      <header className="bg-white border-b-2 border-emerald-700 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <Link to="/farmer" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
                <Sprout size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isMarathi ? 'शेतकरी कक्ष' : 'Farmer Desk'}
                </span>
                <div className="text-base font-black text-slate-900 leading-tight">
                  {isMarathi ? 'कृषीसाक्षी — नुकसान नोंदणी' : 'KrishiSakshi — Loss Reporting'}
                </div>
              </div>
            </Link>

            <div className="sm:hidden flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 text-xs">
            <nav className="flex items-center gap-1.5 font-bold">
              <Link
                to="/farmer"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/farmer' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isMarathi ? '🏠 मुख्य' : '🏠 Home'}
              </Link>
              <Link
                to="/farmer/report"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/farmer/report' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {isMarathi ? '📝 नुकसान नोंदवा' : '📝 Report Loss'}
              </Link>
              <Link
                to="/farmer/my-reports"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/farmer/my-reports' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isMarathi ? '📋 माझे अहवाल' : '📋 My Reports'}
              </Link>
            </nav>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{user?.name || 'राम पाटील'} (शिरोली)</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                title="Log out and return to Home"
              >
                {isMarathi ? '🚪 बाहेर पडा' : '🚪 Logout'}
              </button>
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 3. OFFICER PORTAL HEADER: Navy blue, 100% officer-isolated (NO FARMER MODE BUTTONS)
  if (isOfficer) {
    return (
      <header className="bg-white border-b-2 border-blue-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <Link to="/officer" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-800/20 shrink-0">
                <CheckSquare size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {isMarathi ? 'तालुका कृषी अधिकारी कार्यालय, करवीर' : 'Taluka Agriculture Office, Karveer'}
                </span>
                <div className="text-base font-black text-slate-900 leading-tight">
                  {isMarathi ? 'पडताळणी नियंत्रण कक्ष' : 'Verification Command Desk'}
                </div>
              </div>
            </Link>

            <div className="sm:hidden flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 text-xs">
            <nav className="flex items-center gap-1.5 font-bold">
              <Link
                to="/officer"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/officer' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isMarathi ? '📊 प्राधान्य यादी' : '📊 Priority Triage'}
              </Link>
              <Link
                to="/intelligence"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/intelligence' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isMarathi ? '🔍 पुरावे एकत्रीकरण' : '🔍 Evidence Fusion'}
              </Link>
              <Link
                to="/event-monitor"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/event-monitor' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isMarathi ? '🌧️ हवामान मॉनिटर' : '🌧️ Weather Monitor'}
              </Link>
            </nav>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-900">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{user?.name || 'संजय देशमुख'} (अधिकारी)</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                title="Log out from Officer Desk"
              >
                {isMarathi ? '🚪 लॉगआउट' : '🚪 Logout'}
              </button>
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 4. WEATHER MONITOR HEADER
  return (
    <header className="bg-white border-b-2 border-sky-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <Link to="/event-monitor" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-700 text-white flex items-center justify-center shadow-md shrink-0">
            <CloudRain size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {isMarathi ? 'हवामान आपत्ती मॉनिटर' : 'Weather Deluge Monitor'}
            </span>
            <div className="text-base font-black text-slate-900 leading-tight">
              {isMarathi ? 'कोल्हापूर जिल्हा पर्जन्यमान डेटा' : 'Kolhapur Rainfall Reanalysis'}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 text-xs">
          <Link
            to="/farmer"
            onClick={() => loginAs('FARMER')}
            className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
          >
            {isMarathi ? '🌾 शेतकरी नोंद' : '🌾 Farmer Portal'}
          </Link>
          <Link
            to="/"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
          >
            {isMarathi ? '🏠 मुख्य' : '🏠 Home'}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function MainLayout() {
  const { strings, isMarathi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-primary">
      {/* Honesty Banner */}
      <HonestyBanner />

      {/* Role-Aware Dedicated Dynamic Header */}
      <RoleAwareHeader />

      {/* Main Routed Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/officer/login" element={<OfficerLoginPage />} />
          <Route path="/event-monitor" element={<EventMonitorPage />} />
          <Route path="/intelligence" element={<OfficerProtectedRoute><IntelligencePage /></OfficerProtectedRoute>} />
          <Route path="/officer" element={<OfficerProtectedRoute><OfficerDashboardPage /></OfficerProtectedRoute>} />
          <Route path="/verification/:caseId" element={<OfficerProtectedRoute><VerificationCasePage /></OfficerProtectedRoute>} />
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<FarmerHomePage />} />
            <Route path="report" element={<FarmerReportFlow />} />
            <Route path="my-reports" element={<FarmerMyReportsPage />} />
            <Route path="alerts" element={<FarmerHomePage />} />
          </Route>
        </Routes>
      </main>

      {/* Clean Professional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-slate-800">
              {isMarathi ? 'कृषीसाक्षी — सेवा फर्स्ट इनोव्हेशन चॅलेंज २०२६ (महाराष्ट्र विभाग)' : 'KrishiSakshi — Seva First Innovation Challenge 2026 (Maharashtra Zone)'}
            </div>
            <div>
              {isMarathi 
                ? 'ई-पीक पाहणी आणि अधिकृत क्षेत्रीय पंचनाम्यासोबत कार्य करण्यासाठी तयार केलेली समन्वय प्रणाली.' 
                : 'Designed to work alongside e-Pik Pahani and statutory physical panchnama protocols.'}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-600">
            <span>{isMarathi ? 'प्रायोगिक उद्दिष्ट: १,००० शेतकरी गट' : 'Pilot Scope: 1,000 Farm Units'}</span>
            <span>•</span>
            <span>Open-Meteo ERA5 Reanalysis</span>
            <span>•</span>
            <span className="text-emerald-700 font-extrabold">{isMarathi ? 'पारदर्शक नियम-आधारित प्रणाली' : 'Rule-Based Decision Support'}</span>
            <span>•</span>
            <Link to="/officer/login" className="text-blue-800 hover:underline flex items-center gap-1 font-bold">
              <Lock size={11} />
              <span>{isMarathi ? 'विभागीय अधिकारी कक्ष' : 'Official Desk'}</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <MainLayout />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
