import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sprout, 
  CloudRain, 
  MapPin, 
  Camera, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Navigation, 
  ShieldCheck, 
  FileText,
  Clock,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { compressImage } from '../utils/imageCompressor';
import { API_URL } from '../api/config';

const CROPS = ['Soybean', 'Rice', 'Sugarcane', 'Cotton', 'Other'];
const DAMAGES = ['Heavy rain', 'Flood', 'Waterlogging', 'Hailstorm', 'Strong wind', 'Drought', 'Other'];

export default function FarmerReportFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language: lang, toggleLanguage, strings } = useLanguage();
  const t = strings;

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState('Soybean');
  const [selectedDamage, setSelectedDamage] = useState('Waterlogging');
  
  // Location State
  const [coordinates, setCoordinates] = useState([74.243, 16.705]); // [lng, lat]
  const [locationName, setLocationName] = useState('Kolhapur Demo Center');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // 'success' | 'denied' | null

  // Photo & Description State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [description, setDescription] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Geolocation Handler
  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationStatus(null);

    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;
        const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
        setCoordinates([lng, lat]);
        setLocationName(`GPS Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
        setLocationStatus('success');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error / permission denied:', err.message);
        setLocationStatus('denied');
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Photo Selection with Client-side Compression
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo exceeds 5 MB. Please choose a smaller photo.');
      return;
    }

    try {
      // Compress client-side to ~1280px to save bandwidth
      const compressed = await compressImage(file, 1280, 0.8);
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const formData = new FormData();
      formData.append('crop', selectedCrop);
      formData.append('damageType', selectedDamage);
      formData.append('coordinates', JSON.stringify(coordinates));
      formData.append('description', description);
      formData.append('regionId', 'KOLHAPUR_DISTRICT');
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await axios.post(`${API_URL}/reports`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSubmitResult(res.data.data);
      } else {
        setSubmissionError(res.data?.error?.message || 'Submission failed.');
      }
    } catch (err) {
      setSubmissionError(
        err.response?.data?.error?.message || err.message || 'Error submitting report.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Header Bar with Language Switcher */}
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-agri bg-agri-light px-2 py-0.5 rounded border border-[#C8E6C9]">
            {user ? `${user.name} • ${user.village}` : 'Demo Farmer'}
          </span>
          <h2 className="text-base font-bold text-content-main mt-0.5">
            {currentStep === 1 ? t.step1Title : currentStep === 2 ? t.step2Title : t.step3Title}
          </h2>
        </div>

        <button
          onClick={toggleLanguage}
          className="farmer-tap-target px-2.5 py-1 bg-white hover:bg-page border border-border-default rounded text-xs font-semibold text-content-main flex items-center gap-1.5 transition-colors shadow-subtle"
        >
          <Languages size={14} className="text-primary" />
          <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center gap-2">
        <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>

      {/* SUCCESS SCREEN */}
      {submitResult ? (
        <div className="gov-card p-6 border-l-4 border-l-agri space-y-4 animate-fade-in text-center">
          <div className="w-14 h-14 rounded-full bg-agri-light text-agri flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-content-main">
              {t.successTitle}
            </h3>
            <p className="text-sm text-agri font-semibold mt-1">
              {lang === 'mr' ? submitResult.successMessageMr : submitResult.successMessageEn}
            </p>
          </div>

          {/* Sequential Case ID Box */}
          <div className="p-3 bg-page border border-border-default rounded-md text-left">
            <div className="text-[11px] text-content-secondary uppercase font-semibold">
              {t.caseIdLabel}
            </div>
            <div className="text-xl font-bold font-mono text-primary mt-0.5">
              {submitResult.caseId}
            </div>
            <div className="text-[11px] text-content-secondary mt-1">
              Status: <span className="font-semibold text-content-main">Report Submitted (अहवाल सादर)</span>
            </div>
          </div>

          {/* Simulated SMS Alert Log */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-left text-xs space-y-1">
            <div className="flex items-center justify-between text-primary font-bold">
              <span>SMS Notification Received (Simulated)</span>
              <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-blue-200">DEMO MODE</span>
            </div>
            <p className="text-content-main font-mono text-[11px]">
              "{submitResult.simulatedSms}"
            </p>
            <div className="text-[10px] text-content-secondary pt-1 flex items-center gap-1">
              <Clock size={11} />
              <span>Recorded Replay Time: {new Date(submitResult.effectiveReportedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/farmer/my-reports')}
              className="farmer-tap-target flex-1 px-4 py-2.5 bg-primary text-white rounded-md text-xs font-bold shadow-sm hover:bg-primary-dark"
            >
              <span>{t.myReportsTitle}</span>
            </button>
            <button
              onClick={() => {
                setSubmitResult(null);
                setCurrentStep(1);
              }}
              className="farmer-tap-target flex-1 px-4 py-2.5 bg-page border border-border-default text-content-main rounded-md text-xs font-semibold hover:bg-gray-100"
            >
              <span>नवीन अहवाल नोंदवा</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3-STEP FORM */
        <div className="gov-card p-5 space-y-5">
          {/* STEP 1: CROP & DAMAGE TYPE */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Crop Selection */}
              <div>
                <label className="block text-xs font-bold text-content-main mb-2">
                  १. {t.selectCrop}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CROPS.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setSelectedCrop(crop)}
                      className={`farmer-tap-target p-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        selectedCrop === crop
                          ? 'bg-agri text-white border-agri shadow-sm'
                          : 'bg-page hover:bg-gray-100 border-border-default text-content-main'
                      }`}
                    >
                      <Sprout size={16} />
                      <span>{t.crops[crop]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Damage Reason Selection */}
              <div>
                <label className="block text-xs font-bold text-content-main mb-2">
                  २. {t.selectDamage}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAMAGES.map((damage) => (
                    <button
                      key={damage}
                      type="button"
                      onClick={() => setSelectedDamage(damage)}
                      className={`farmer-tap-target p-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        selectedDamage === damage
                          ? 'bg-priority-high text-white border-priority-high shadow-sm'
                          : 'bg-page hover:bg-gray-100 border-border-default text-content-main'
                      }`}
                    >
                      <CloudRain size={16} />
                      <span>{t.damages[damage]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="farmer-tap-target w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>{t.continueBtn}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & OPTIONAL PHOTO */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Geolocation Section */}
              <div>
                <label className="block text-xs font-bold text-content-main mb-1.5">
                  शेताचे स्थान (Farm Location)
                </label>
                
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="farmer-tap-target w-full p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-primary rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-colors mb-2"
                >
                  <Navigation size={16} className={isLocating ? 'animate-spin' : ''} />
                  <span>{isLocating ? 'स्थान शोधत आहे...' : t.detectGps}</span>
                </button>

                {/* Location Success or Denied Banner */}
                {locationStatus === 'success' && (
                  <div className="p-2.5 bg-green-50 border border-green-200 rounded text-xs text-agri flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{locationName}</span>
                  </div>
                )}

                {locationStatus === 'denied' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-priority-warning space-y-2">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{t.gpsDenied}</span>
                    </div>

                    {/* Manual Area Selection Fallback */}
                    <div className="pt-1">
                      <span className="block text-[11px] font-semibold text-content-main mb-1">
                        नजीकचे गाव निवडा (Select Approximate Village):
                      </span>
                      <select
                        onChange={(e) => {
                          const val = e.target.value.split(',');
                          setCoordinates([parseFloat(val[0]), parseFloat(val[1])]);
                          setLocationName(e.target.options[e.target.selectedIndex].text);
                        }}
                        className="farmer-tap-target w-full px-3 py-1.5 bg-white border border-border-default rounded text-xs font-medium text-content-main"
                      >
                        <option value="74.243,16.705">Kolhapur Central (16.705° N, 74.243° E)</option>
                        <option value="74.314,16.576">Kagal Zone (16.576° N, 74.314° E)</option>
                        <option value="74.110,16.810">Panhala Zone (16.810° N, 74.110° E)</option>
                        <option value="74.597,16.737">Shirol Zone (16.737° N, 74.597° E)</option>
                        <option value="74.346,16.226">Gadhinglaj Zone (16.226° N, 74.346° E)</option>
                      </select>
                    </div>
                  </div>
                )}

                {!locationStatus && (
                  <div className="p-2 bg-page border border-border-default rounded text-[11px] text-content-secondary flex items-center justify-between">
                    <span>Default Reference: {locationName}</span>
                    <span className="font-mono">{coordinates[1].toFixed(3)}, {coordinates[0].toFixed(3)}</span>
                  </div>
                )}
              </div>

              {/* Optional Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-content-main mb-1 flex items-center justify-between">
                  <span>{t.photoLabel}</span>
                  <span className="text-[10px] text-content-secondary font-normal">Optional</span>
                </label>

                <div className="border-2 border-dashed border-border-default rounded-md p-4 text-center hover:bg-page transition-colors relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Camera size={24} className="text-content-secondary mx-auto mb-1" />
                  <span className="text-xs font-semibold text-primary block">
                    {photoFile ? photoFile.name : 'फोटो निवडा किंवा कॅमेरा वापरा'}
                  </span>
                  <span className="text-[10px] text-content-secondary block mt-0.5">
                    {t.photoNote}
                  </span>
                </div>

                {photoPreview && (
                  <div className="mt-2 relative w-24 h-24 rounded border border-border-default overflow-hidden">
                    <img src={photoPreview} alt="Damage preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-semibold text-content-main mb-1">
                  {t.descriptionLabel}
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="उदा. शेतात ३ दिवस पाणी साचून राहिले आहे..."
                  className="w-full p-2.5 bg-page border border-border-default rounded-md text-xs text-content-main focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="farmer-tap-target px-4 py-2 bg-page hover:bg-gray-100 text-content-main rounded-md text-xs font-semibold flex items-center gap-1 border border-border-default"
                >
                  <ArrowLeft size={14} />
                  <span>{t.backBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="farmer-tap-target px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>{t.continueBtn}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM & SUBMIT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-page border border-border-default rounded-md space-y-2 text-xs">
                <div className="text-[11px] font-bold text-content-secondary uppercase tracking-wider border-b border-border-default pb-1">
                  अहवाल तपशील (Report Summary)
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-content-secondary">पीक (Crop):</span>
                  <strong className="text-content-main">{t.crops[selectedCrop]} ({selectedCrop})</strong>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-content-secondary">नुकसानीचे कारण (Damage):</span>
                  <strong className="text-priority-high">{t.damages[selectedDamage]} ({selectedDamage})</strong>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-content-secondary">शेताचे स्थान (Coordinates):</span>
                  <span className="font-mono text-content-main">{coordinates[1].toFixed(4)}° N, {coordinates[0].toFixed(4)}° E</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-content-secondary">फोटो जोडला आहे का?</span>
                  <span className="font-semibold">{photoFile ? 'होय (Yes)' : 'नाही (None)'}</span>
                </div>
              </div>

              {/* Error message */}
              {submissionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-priority-high font-medium">
                  {submissionError}
                </div>
              )}

              {/* Honesty note: No compensation claim */}
              <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-content-secondary">
                <span className="font-bold text-content-main">नोंद: </span>
                <span>हा अहवाल नुकसान पडताळणी प्राधान्य ठरवण्यासाठी शासकीय अधिकाऱ्यांना मदत करतो. नुकसान भरपाई बाबतचा निर्णय अधिकृत पंचनाम्यानंतर सक्षम अधिकारी घेतात.</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="farmer-tap-target px-4 py-2 bg-page hover:bg-gray-100 text-content-main rounded-md text-xs font-semibold flex items-center gap-1 border border-border-default"
                >
                  <ArrowLeft size={14} />
                  <span>{t.backBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="farmer-tap-target px-6 py-2.5 bg-agri hover:bg-green-800 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
                  <CheckCircle size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
