import { createContext, useContext, useMemo, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

const read = () => {
  try {
    const saved = localStorage.getItem('language');
    return saved === 'en' || saved === 'sw' ? saved : 'en';
  } catch { return 'en'; }
};

export function LanguageProvider({ children }) {
  const [language, setCurrent] = useState(read);

  const value = useMemo(() => ({
    language,
    setLanguage: (next) => {
      if (next !== 'en' && next !== 'sw') return;
      setCurrent(next);
      try { localStorage.setItem('language', next); } catch { /* session only */ }
    },
    t: (key) => translations[language]?.[key] ?? translations.en[key] ?? key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
