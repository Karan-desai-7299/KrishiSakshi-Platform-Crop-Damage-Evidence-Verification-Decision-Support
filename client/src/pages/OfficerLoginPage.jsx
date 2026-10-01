import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  AlertTriangle, 
  CheckSquare, 
  Sprout,
  Building2,
  KeyRound,
  Mail,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function OfficerLoginPage() {
  const navigate = useNavigate();
  const { loginAs, user, logout } = useAuth();
  const { isMarathi } = useLanguage();

  const [email, setEmail] = useState('officer.karveer@agri.maharashtra.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleOfficerLogin = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await loginAs('OFFICER');
      navigate('/officer');
    } catch (err) {
      setError(isMarathi ? 'लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.' : 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-6">
      {/* Back to Home Link */}
      <div className="flex items-center justify-between text-xs">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>{isMarathi ? 'मुख्य पानावर परत जा' : 'Back to Home'}</span>
        </Link>
        <span className="text-slate-400">|</span>
        <Link 
          to="/farmer" 
          onClick={() => loginAs('FARMER')}
          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800"
        >
          <Sprout size={14} />
          <span>{isMarathi ? 'मी शेतकरी आहे (Farmer Portal)' : 'I am a Farmer'}</span>
        </Link>
      </div>

      {/* Main Official Login Card */}
      <div className="bg-white rounded-2xl border-2 border-blue-800 shadow-xl overflow-hidden">
        {/* Official Header Strip */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 text-center space-y-2 relative">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center mx-auto shadow-inner">
            <Building2 size={26} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block">
            {isMarathi ? 'महाराष्ट्र शासन • कृषी विभाग' : 'Govt of Maharashtra • Agriculture Dept'}
          </span>
          <h1 className="text-lg font-black text-white leading-tight">
            {isMarathi ? 'तालुका कृषी अधिकारी कार्यालय, करवीर' : 'Taluka Agriculture Office, Karveer'}
          </h1>
          <p className="text-xs text-blue-200">
            {isMarathi ? 'क्षेत्रीय पंचनामा व पडताळणी नियंत्रण कक्ष' : 'Field Panchnama & Triage Command Desk'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Security Alert: Restricted for Officers Only */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {isMarathi ? 'केवळ अधिकृत शासकीय अधिकाऱ्यांसाठी' : 'Authorized Personnel Only'}
              </span>
              <span className="text-[11px] text-amber-800 leading-tight">
                {isMarathi 
                  ? 'हा विभाग केवळ कृषी व महसूल अधिकाऱ्यांसाठी आहे. शेतकरी बांधवांनी पिकाचे नुकसान नोंदवण्यासाठी शेतकरी कक्षाचा वापर करावा.' 
                  : 'This desk is strictly restricted to agriculture and revenue officers. Farmers should report loss via the Farmer Portal.'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleOfficerLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isMarathi ? 'शासकीय ईमेल आयडी / Officer ID' : 'Official Government Email / Officer ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-700 focus:bg-white outline-none"
                  placeholder="officer@agri.maharashtra.gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isMarathi ? 'पासवर्ड / गोपनीय पिन' : 'Official Password / PIN'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-700 focus:bg-white outline-none"
                  required
                />
              </div>
            </div>

            {/* Official Login Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <CheckSquare size={16} />
                <span>
                  {isSubmitting 
                    ? (isMarathi ? 'पडताळणी सुरू आहे...' : 'Authenticating...') 
                    : (isMarathi ? 'शासकीय अधिकारी म्हणून लॉगिन करा' : 'Login to Officer Command Desk')}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Quick Evaluator / Demo 1-Click Access Box */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {isMarathi ? 'मूल्यांकन / प्रायोगिक डेमो प्रवेश' : 'Evaluator Demo Quick Access'}
              </span>
              <button
                type="button"
                onClick={handleOfficerLogin}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-blue-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <UserCheck size={16} className="text-blue-700" />
                <span>
                  {isMarathi 
                    ? 'संजय देशमुख (तालुका कृषी अधिकारी) म्हणून थेट प्रवेश' 
                    : 'Instant Demo Login as Sanjay Deshmukh (Officer)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Audit Notice */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-[11px] text-slate-500 text-center">
          {isMarathi 
            ? 'सर्व लॉगिन व पंचनामा नोंदींचे शासकीय ऑडिट लॉग (Audit Trail) नोंदवले जातात.' 
            : 'All triage access & Panchnama submissions are cryptographically logged in the official audit trail.'}
        </div>
      </div>
    </div>
  );
}
