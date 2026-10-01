import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('krishi_language') || 'mr'; // Marathi default
  });

  const setLanguage = (lang) => {
    const validLang = lang === 'en' ? 'en' : 'mr';
    setLanguageState(validLang);
    localStorage.setItem('krishi_language', validLang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'mr' ? 'en' : 'mr');
  };

  // Safe translation resolver: t('landing.heroTitle') or t('common.submit')
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');
    let current = TRANSLATIONS[language];
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English if key missing in Marathi
        let engFallback = TRANSLATIONS['en'];
        for (const p of parts) {
          if (engFallback && typeof engFallback === 'object' && p in engFallback) {
            engFallback = engFallback[p];
          } else {
            return fallback || path;
          }
        }
        return engFallback;
      }
    }
    return typeof current === 'string' ? current : (fallback || path);
  };

  const strings = TRANSLATIONS[language] || TRANSLATIONS.mr;

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      strings,
      isMarathi: language === 'mr',
      isEnglish: language === 'en'
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
