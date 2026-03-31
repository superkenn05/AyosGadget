'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'fil';

interface TranslationDict {
  [key: string]: {
    en: string;
    fil: string;
  };
}

export const translations: TranslationDict = {
  // Common
  common_login_required: { en: 'Login Required', fil: 'Kailangang Mag-login' },
  common_login_desc: { en: 'Please login to see your saved repair guides.', fil: 'Mag-login para makita ang iyong mga naka-save na repair guides.' },
  common_login_google: { en: 'Login with Google', fil: 'Mag-login gamit ang Google' },
  common_syncing: { en: 'Syncing Data...', fil: 'Nag-sync ng Data...' },
  common_exit: { en: 'Exit Protocol', fil: 'Lumabas' },
  common_system: { en: 'System', fil: 'System' },
  common_module: { en: 'Module', fil: 'Module' },
  common_error_link: { en: 'Neural Link Offline', fil: 'Neural Link Offline' },
  common_error_desc: { en: 'We could not connect to the iFixit library. Please refresh for manual resync.', fil: 'Hindi kami makakonekta sa iFixit library. Pakisuyong i-refresh ang iyong browser.' },
  common_retry: { en: 'Retry Connection', fil: 'Subukan Muli' },

  // Home
  home_title: { en: 'Neural Analyzer', fil: 'Neural Analyzer' },
  home_subtitle: { en: 'Ready for hardware maintenance protocols and AI-driven troubleshooting.', fil: 'Handa na sa pag-aayos at pag-check ng gadget gamit ang AI.' },
  home_start_scan: { en: 'Start Scan', fil: 'Simulan ang Check-up' },
  home_modules: { en: 'Available Modules', fil: 'Mga Gamit' },
  home_global_hub: { en: 'Global Hub', fil: 'Global Hub' },
  home_auxiliary: { en: 'Auxiliary Directory', fil: 'Karagdagang Directory' },
  home_trending: { en: 'Trending Protocols', fil: 'Trending na Gabay' },
  home_refresh: { en: 'Refresh Data', fil: 'I-refresh ang Data' },

  // Guides
  guides_title: { en: 'Protocols', fil: 'Mga Gabay' },
  guides_subtitle: { en: 'Hardware Library v4.2', fil: 'Library ng mga Sira' },
  guides_search: { en: 'SEARCH SYSTEM LOGS...', fil: 'MAGHANAP DITO...' },
  guides_all: { en: 'All Protocols', fil: 'Lahat ng Gabay' },
  guides_neural_ask: { en: 'Neural Ask', fil: 'Magtanong sa AI' },
  guides_master_modules: { en: 'Master Modules', fil: 'Master Modules' },
  guides_not_found: { en: 'No Protocols Found', fil: 'Walang Nakitang Guide' },
  guides_adjust: { en: 'Try adjusting your neural search parameters.', fil: 'Subukang baguhin ang iyong hinahanap.' },
  guides_access_more: { en: 'Access More Protocols', fil: 'Tumingin pa ng Gabay' },

  // Guide Detail Labels
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
  troubleshoot_ai_badge: { en: 'AI-Powered Assistant', fil: 'AI-Powered Assistant' },
  troubleshoot_how_to: { en: 'How to use?', fil: 'Paano ito gamitin?' },
  troubleshoot_step1_title: { en: 'Describe the device', fil: 'Ilarawan ang device' },
  troubleshoot_step1_desc: { en: 'Tell us if it is a smartphone, laptop, or appliance.', fil: 'Sabihin kung smartphone, laptop, o appliance ang may sira.' },
  troubleshoot_step2_title: { en: 'Explain the fault', fil: 'Ipaliwanag ang sira' },
  troubleshoot_step2_desc: { en: 'What is happening? Won\'t turn on? Broken screen?', fil: 'Anong nangyayari? Ayaw bang bumukas? Basag ba ang screen?' },
  troubleshoot_step3_title: { en: 'Follow Ayos AI', fil: 'Sundin ang Ayos AI' },
  troubleshoot_step3_desc: { en: 'The AI will respond with solutions or more questions.', fil: 'Sasagutin ka ng AI ng mga solusyon o tanong.' },
  troubleshoot_why_ai: { en: 'Why AI?', fil: 'Bakit AI?' },
  troubleshoot_why_ai_desc: { en: 'We use modern AI models to help you find the right repair guide faster.', fil: 'Ginagamit namin ang modernong AI para mabilis mong mahanap ang tamang gabay.' },

  // Chat
  chat_init: { en: 'NEURAL SYSTEM INITIALIZED. UPTIME: 99.9%. READY TO DIAGNOSE HARDWARE FAULTS. PLEASE INPUT DEVICE LOGS OR DESCRIPTION.', fil: 'NEURAL SYSTEM INITIALIZED. READY TO DIAGNOSE. PAKISABI ANG PROBLEMA NG IYONG GADGET.' },
  chat_placeholder: { en: 'ENTER COMMAND...', fil: 'MAG-TYPE DITO...' },
  chat_telemetry: { en: 'REQUIRED TELEMETRY:', fil: 'KAILANGANG IMPORMASYON:' },
  chat_sequence: { en: 'REPAIR SEQUENCE:', fil: 'HAKBANG SA PAG-AAYOS:' },
  chat_error: { en: 'CRITICAL: NEURAL LINK SEVERED. ATTEMPTING RECONNECT...', fil: 'CRITICAL: NAPUTOL ANG KONEKSYON. SINUSUBUKANG MAG-RECONNECT...' },
  chat_running: { en: 'Running Neural Simulation...', fil: 'Sinisiyasat ng AI...' },
  chat_linked_protocols: { en: 'Linked Protocols Found:', fil: 'Mga Nakitang Gabay:' },

  // Bookmarks
  bookmarks_title: { en: 'Saved Vault', fil: 'Mga Naka-save' },
  bookmarks_subtitle: { en: 'Your collection of repair guides.', fil: 'Ang iyong koleksyon ng mga repair guides.' },
  bookmarks_empty_title: { en: 'Nothing saved yet', fil: 'Wala pang naka-save' },
  bookmarks_empty_desc: { en: 'Save guides to find them quickly later.', fil: 'Mag-save ng mga gabay para mabilis mo itong mahanap.' },
  bookmarks_browse: { en: 'Browse Guides', fil: 'Mag-browse ng mga Gabay' },

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
