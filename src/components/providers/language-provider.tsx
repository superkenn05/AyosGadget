'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import '@/lib/i18n/config';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'fil';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isMounted: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-lang', lang);
    }
  };

  const language = (i18n.language || 'en') as Language;

  // Render children only after mounting to prevent hydration mismatches
  // We return null or a skeleton if not mounted to ensure server/client HTML match
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isMounted }}>
      {isMounted ? children : null}
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
