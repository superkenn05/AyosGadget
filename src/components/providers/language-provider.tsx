'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'fil';

interface TranslationDict {
  [key: string]: {
    en: string;
    fil: string;
  };
}

const translations: TranslationDict = {
  // Home
  home_title: { en: 'Neural Analyzer', fil: 'Neural Analyzer' },
  home_subtitle: { en: 'Ready for hardware maintenance protocols and AI-driven troubleshooting.', fil: 'Handa na sa pag-aayos at pag-check ng gadget gamit ang AI.' },
  home_start_scan: { en: 'Start Scan', fil: 'Simulan ang Check-up' },
  home_modules: { en: 'Available Modules', fil: 'Mga Gamit' },
  home_priority: { en: 'Priority Protocols', fil: 'Importanteng Ayusin' },
  // Guides
  guides_title: { en: 'Protocols', fil: 'Mga Gabay' },
  guides_subtitle: { en: 'Hardware Library v4.2', fil: 'Library ng mga Sira' },
  guides_search: { en: 'SEARCH SYSTEM LOGS...', fil: 'MAGHANAP DITO...' },
  guides_all: { en: 'All Logs', fil: 'Lahat' },
  // Troubleshoot
  troubleshoot_title: { en: 'Interactive Troubleshooter', fil: 'AI Chat Assistant' },
  troubleshoot_subtitle: { en: 'Identify your gadget problem by chatting with Ayos AI.', fil: 'Pag-usapan natin ang sira ng gadget mo para malaman ang gagawin.' },
  troubleshoot_how_to: { en: 'How to use?', fil: 'Paano gamitin?' },
  // Bookmarks
  bookmarks_title: { en: 'Saved Vault', fil: 'Mga Naka-save' },
  bookmarks_subtitle: { en: 'Your collection of repair guides.', fil: 'Dito makikita ang mga itinabi mong guides.' },
  // Settings
  settings_title: { en: 'System Config', fil: 'Settings' },
  settings_appearance: { en: 'Appearance', fil: 'Tema at Kulay' },
  settings_language: { en: 'Language', fil: 'Wika' },
  settings_account: { en: 'Account', fil: 'Account' },
  settings_about: { en: 'About', fil: 'Tungkol sa App' },
  settings_terminate: { en: 'Terminate Session', fil: 'Mag-Logout' },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-lang', language);
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
