import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HonestyBanner() {
  const { strings, isMarathi } = useLanguage();

  return (
    <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
        <span className="font-semibold text-emerald-800">
          {strings.honesty?.bannerText || (isMarathi
            ? 'कृषीसाक्षी हे नियम-आधारित निर्णय साहाय्य साधन आहे. ही प्रणाली ई-पीक पाहणी किंवा पंचनाम्याची जागा घेत नाही आणि नुकसानभरपाई मंजूर करत नाही.'
            : 'KrishiSakshi is a rule-based decision support tool. It does NOT replace e-Pik Pahani or Panchnama, and does NOT approve compensation.')
          }
        </span>
      </div>
      <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold text-emerald-800 hidden md:inline-block shrink-0">
        Seva First Innovation Challenge 2026
      </span>
    </div>
  );
}
