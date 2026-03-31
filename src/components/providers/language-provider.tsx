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
  guides_results: { en: 'Filtered Results', fil: 'Nakita naming Guides' },
  guides_not_found: { en: 'No Protocols Found', fil: 'Walang Nakitang Guide' },
  guides_adjust: { en: 'Try adjusting your neural search parameters.', fil: 'Subukang baguhin ang iyong hinahanap.' },
  // Guide Detail
  guides_back: { en: 'Back to Guides', fil: 'Bumalik sa Listahan' },
  guides_difficulty_easy: { en: 'Easy', fil: 'Madali' },
  guides_difficulty_medium: { en: 'Medium', fil: 'Katamtaman' },
  guides_difficulty_hard: { en: 'Hard', fil: 'Mahirap' },
  guides_time: { en: 'Estimated Time', fil: 'Mungkahing Oras' },
  guides_tools: { en: 'Tools Required', fil: 'Mga Gamit na Kailangan' },
  guides_parts: { en: 'Parts Required', fil: 'Mga Piyesang Kailangan' },
  guides_steps: { en: 'Step-by-Step Instructions', fil: 'Mga Hakbang sa Paggawa' },
  guides_buy_kit: { en: 'Buy Repair Kit', fil: 'Bumili ng Repair Kit' },
  guides_order_parts: { en: 'Order Parts', fil: 'Mag-order ng Piyesa' },
  guides_save: { en: 'Save Guide', fil: 'I-save itong Guide' },
  guides_saved: { en: 'Saved', fil: 'Naka-save na' },
  guides_help_title: { en: 'Need help?', fil: 'Kailangan ng tulong?' },
  guides_help_desc: { en: 'If you find it hard, ask our community or use AI.', fil: 'Kung nahihirapan, magtanong sa community o gamitin ang Ayos AI.' },
  guides_ask_ai: { en: 'Ask Ayos AI', fil: 'Magtanong sa Ayos AI' },
  // Troubleshoot
  troubleshoot_title: { en: 'Interactive Troubleshooter', fil: 'AI Chat Assistant' },
  troubleshoot_subtitle: { en: 'Identify your gadget problem by chatting with Ayos AI.', fil: 'Pag-usapan natin ang sira ng gadget mo para malaman ang gagawin.' },
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
