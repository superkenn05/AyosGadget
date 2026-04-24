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
  common_login_required: { en: 'Login Required', fil: 'Kinakailangan ang Pag-uulat' },
  common_login_desc: { en: 'Please login to see your saved repair guides.', fil: 'Mangyaring mag-ulat upang makita ang iyong mga naka-imbak na gabay sa pagkukumpuni.' },
  common_login_google: { en: 'Login with Google', fil: 'Mag-ulat gamit ang Google' },
  common_syncing: { en: 'Syncing Data...', fil: 'Sinasabay ang mga Datos...' },
  common_exit: { en: 'Exit Protocol', fil: 'Pag-alis sa Sistema' },
  common_system: { en: 'System', fil: 'Sistema' },
  common_module: { en: 'Module', fil: 'Modyul' },
  common_error_link: { en: 'Neural Link Offline', fil: 'Naputol ang Koneksyon' },
  common_error_desc: { en: 'We could not connect to the iFixit library. Please refresh for manual resync.', fil: 'Hindi kami makakonekta sa aklatan. Mangyaring sariwain ang pahina.' },
  common_retry: { en: 'Retry Connection', fil: 'Subukang Muli' },

  // Home
  home_title: { en: 'Neural Analyzer', fil: 'Matalinong Pagsusuri' },
  home_subtitle: { en: 'Ready for hardware maintenance protocols and AI-driven troubleshooting.', fil: 'Handa para sa mga alituntunin ng pagkukumpuni at matalinong pagsisiyasat.' },
  home_start_scan: { en: 'Start Scan', fil: 'Simulan ang Pagsisiyasat' },
  home_modules: { en: 'Available Modules', fil: 'Mga Kagamitang Matatagpuan' },
  home_global_hub: { en: 'Global Hub', fil: 'Sentral na Pamilihan' },
  home_auxiliary: { en: 'Auxiliary Directory', fil: 'Karagdagang Talaan' },
  home_trending: { en: 'Trending Protocols', fil: 'Tanyag na mga Gabay' },
  home_refresh: { en: 'Refresh Data', fil: 'Sariwain ang Datos' },
  home_neural_active: { en: 'Neural Diagnostic Link: Active', fil: 'Koneksyon sa Pagsusuri: Aktibo' },

  // Guides
  guides_title: { en: 'Protocols', fil: 'Mga Alituntunin' },
  guides_subtitle: { en: 'Hardware Library v4.2', fil: 'Aklatan ng mga Kagamitan' },
  guides_search: { en: 'SEARCH SYSTEM LOGS...', fil: 'MAGHANAP SA TALAAN...' },
  guides_all: { en: 'All Protocols', fil: 'Lahat ng Gabay' },
  guides_neural_ask: { en: 'Neural Ask', fil: 'Magtanong sa Artipisyal na Talino' },
  guides_master_modules: { en: 'Master Modules', fil: 'Pangunahing Modyul' },
  guides_not_found: { en: 'No Protocols Found', fil: 'Walang Nakitang Gabay' },
  guides_adjust: { en: 'Try adjusting your neural search parameters.', fil: 'Subukang baguhin ang iyong mga hinahanap.' },
  guides_access_more: { en: 'Access More Protocols', fil: 'Tumingin ng iba pang Gabay' },

  // Guide Detail Labels
  guides_back: { en: 'Back to Guides', fil: 'Bumalik sa mga Talaan' },
  guides_difficulty_easy: { en: 'Easy', fil: 'Madali' },
  guides_difficulty_medium: { en: 'Medium', fil: 'Katamtaman' },
  guides_difficulty_hard: { en: 'Hard', fil: 'Mahirap' },
  guides_time: { en: 'Estimated Time', fil: 'Tantyang Oras' },
  guides_tools: { en: 'Tools Required', fil: 'Mga Kagamitang Kinakailangan' },
  guides_parts: { en: 'Parts Required', fil: 'Mga Piyesang Kinakailangan' },
  guides_steps: { en: 'Step-by-Step Instructions', fil: 'Sunod-sunod na mga Panuto' },
  guides_step_title: { en: 'Step', fil: 'Hakbang' },
  guides_buy_kit: { en: 'Buy Repair Kit', fil: 'Bumili ng Kagamitan sa Kumpuni' },
  guides_order_parts: { en: 'Order Parts', fil: 'Mag-order ng Piyesa' },
  guides_save: { en: 'Save Guide', fil: 'Itala ang Gabay' },
  guides_saved: { en: 'Saved', fil: 'Naitumpok na' },
  guides_help_title: { en: 'Need help?', fil: 'Kailangan ng Saklolo?' },
  guides_help_desc: { en: 'If you find it hard, ask our community or use AI.', fil: 'Kung nahihirapan, sumangguni sa aming samahan o sa artipisyal na talino.' },
  guides_ask_ai: { en: 'Ask Ayos AI', fil: 'Sumangguni sa Ayos AI' },

  // Troubleshoot
  troubleshoot_title: { en: 'Interactive Troubleshooter', fil: 'Masusing Pagsisiyasat' },
  troubleshoot_subtitle: { en: 'Identify your gadget problem by chatting with Ayos AI.', fil: 'Alamin ang suliranin ng iyong kagamitan sa pakikipag-usap sa Ayos AI.' },
  troubleshoot_ai_badge: { en: 'AI-Powered Assistant', fil: 'Katulong na Pinatatakbo ng AI' },
  troubleshoot_how_to: { en: 'How to use?', fil: 'Paano Gamitin?' },
  troubleshoot_step1_title: { en: 'Describe the device', fil: 'Ilarawan ang kagamitan' },
  troubleshoot_step1_desc: { en: 'Tell us if it is a smartphone, laptop, or appliance.', fil: 'Ipaalam kung ito ay telepono, madalíng-bitbit na kompyuter, o kasangkapan.' },
  troubleshoot_step2_title: { en: 'Explain the fault', fil: 'Ipaliwanag ang sira' },
  troubleshoot_step2_desc: { en: 'What is happening? Won\'t turn on? Broken screen?', fil: 'Ano ang nangyayari? Ayaw bang bumukas? Basag ba ang tabing?' },
  troubleshoot_step3_title: { en: 'Follow Ayos AI', fil: 'Sundin ang Ayos AI' },
  troubleshoot_step3_desc: { en: 'The AI will respond with solutions or more questions.', fil: 'Sasagot ang AI ng mga lunas o karagdagang tanong.' },
  troubleshoot_why_ai: { en: 'Why AI?', fil: 'Bakit AI?' },
  troubleshoot_why_ai_desc: { en: 'We use modern AI models to help you find the right repair guide faster.', fil: 'Gumagamit kami ng makabagong AI upang mabilis mong mahanap ang tamang gabay.' },

  // Chat
  chat_init: { en: 'NEURAL SYSTEM INITIALIZED. READY TO DIAGNOSE.', fil: 'SISTEMA AY NAHANDA NA. HANDA NA PARA SA PAGSUSURI. PAKISABI ANG SULIRANIN.' },
  chat_placeholder: { en: 'ENTER COMMAND...', fil: 'MAGSULAT DITO...' },
  chat_telemetry: { en: 'REQUIRED TELEMETRY:', fil: 'IMPORMASYONG KINAKAILANGAN:' },
  chat_sequence: { en: 'REPAIR SEQUENCE:', fil: 'HAKBANG SA PAGKUKUMPUNI:' },
  chat_error: { en: 'CRITICAL: NEURAL LINK SEVERED.', fil: 'MAPANGANIB: NAPUTOL ANG KONEKSYON.' },
  chat_running: { en: 'Running Neural Simulation...', fil: 'Kasalukuyang Nagsusuri...' },
  chat_linked_protocols: { en: 'Linked Protocols Found:', fil: 'Mga Gabay na Natagpuan:' },
  chat_analyzer: { en: 'NEURAL ANALYZER', fil: 'MATALINONG TAGASURI' },
  chat_stable: { en: 'Stable', fil: 'Maayos' },
  chat_auth_verified: { en: 'Auth: verified', fil: 'Katunayan: napatunayan' },
  chat_power_optimal: { en: 'Power: optimal', fil: 'Lakas: sapat' },

  // Bookmarks
  bookmarks_title: { en: 'Saved Vault', fil: 'Naitagong Talaan' },
  bookmarks_subtitle: { en: 'Your collection of repair guides.', fil: 'Ang iyong koleksyon ng mga gabay.' },
  bookmarks_empty_title: { en: 'Nothing saved yet', fil: 'Wala pang naitatago' },
  bookmarks_empty_desc: { en: 'Save guides to find them quickly later.', fil: 'Itago ang mga gabay upang mabilis itong mahanap muli.' },
  bookmarks_browse: { en: 'Browse Guides', fil: 'Tumingin ng mga Gabay' },

  // Settings
  settings_title: { en: 'System Config', fil: 'Pag-aayos ng Sistema' },
  settings_appearance: { en: 'Appearance', fil: 'Anyo ng Sistema' },
  settings_language: { en: 'Language', fil: 'Wika' },
  settings_account: { en: 'Account', fil: 'Account' },
  settings_security: { en: 'Security', fil: 'Seguridad' },
  settings_about: { en: 'About', fil: 'Tungkol sa Amin' },
  settings_terminate: { en: 'Terminate Session', fil: 'Tapusin ang Pagbisita' },
  settings_version: { en: 'Software Version', fil: 'Bersyon ng Program' },
  settings_check_updates: { en: 'Check Updates', fil: 'Tingnan ang mga Pagbabago' },

  // Cards
  card_priority_task: { en: 'Priority Task', fil: 'Mahalagang Gawain' },
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
