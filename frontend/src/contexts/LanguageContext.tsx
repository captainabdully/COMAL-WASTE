import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'sw';

const translations = {
  en: {
    language: 'Language', english: 'English', swahili: 'Swahili',
    welcomeBack: 'Welcome Back', signInPrompt: 'Sign in to your account', emailAddress: 'Email Address', password: 'Password', signIn: 'Sign In', signingIn: 'Signing in...',
    dashboard: 'Dashboard', vendors: 'Vendors', pickupRequests: 'Pickup Requests', dailyPrices: 'Daily Prices', fleetManagement: 'Fleet Management', financial: 'Financial', reports: 'Reports', adminPanel: 'Admin Panel', logout: 'Logout',
    platform: 'COMAL Platform', platformSubtitle: 'Smart Scrap Material Management System',
    completedScrap: 'Completed Scrap', completedOrders: 'Completed orders', cancelledOrders: 'Cancelled Orders', allTime: 'All time', pendingOrders: 'Pending Orders', awaitingAssignment: 'Awaiting assignment',
    requestsThisMonth: 'Requests This Month', createdThisMonth: 'Created this month', activeVendors: 'Active Vendors', registeredVendorAccounts: 'Registered vendor accounts', pendingPayment: 'Pending Payment', assignedOrders: 'Assigned orders', completedJobsThisMonth: 'Completed Jobs This Month', completedThisMonth: 'Completed this month',
    sessionExpired: 'Session expired', sessionExpiredMessage: 'Please sign in again to continue.', goToSignIn: 'Go to sign in',
    search: 'Search...', actions: 'Actions', showing: 'Showing', of: 'of', previous: 'Previous', next: 'Next',
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected', completed: 'Completed', inProgress: 'In Progress', paid: 'Paid', unpaid: 'Unpaid',
  },
  sw: {
    language: 'Lugha', english: 'Kiingereza', swahili: 'Kiswahili',
    welcomeBack: 'Karibu Tena', signInPrompt: 'Ingia kwenye akaunti yako', emailAddress: 'Barua pepe', password: 'Nenosiri', signIn: 'Ingia', signingIn: 'Inaingia...',
    dashboard: 'Dashibodi', vendors: 'Wauzaji', pickupRequests: 'Maombi ya Ukusanyaji', dailyPrices: 'Bei za Kila Siku', fleetManagement: 'Usimamizi wa Magari', financial: 'Fedha', reports: 'Ripoti', adminPanel: 'Jopo la Msimamizi', logout: 'Toka',
    platform: 'Jukwaa la COMAL', platformSubtitle: 'Mfumo Mahiri wa Usimamizi wa Vifaa Chakavu',
    completedScrap: 'Chuma Chakavu Kilichokamilika', completedOrders: 'Maombi yaliyokamilika', cancelledOrders: 'Maombi Yaliyoghairiwa', allTime: 'Muda wote', pendingOrders: 'Maombi Yanayosubiri', awaitingAssignment: 'Yanasubiri kupangiwa',
    requestsThisMonth: 'Maombi ya Mwezi Huu', createdThisMonth: 'Yaliyoanzishwa mwezi huu', activeVendors: 'Wauzaji Hai', registeredVendorAccounts: 'Akaunti za wauzaji waliosajiliwa', pendingPayment: 'Malipo Yanayosubiri', assignedOrders: 'Maombi yaliyopangiwa', completedJobsThisMonth: 'Kazi Zilizokamilika Mwezi Huu', completedThisMonth: 'Zilizokamilika mwezi huu',
    sessionExpired: 'Muda wa kikao umeisha', sessionExpiredMessage: 'Tafadhali ingia tena ili kuendelea.', goToSignIn: 'Nenda kuingia',
    search: 'Tafuta...', actions: 'Vitendo', showing: 'Inaonyesha', of: 'kati ya', previous: 'Iliyotangulia', next: 'Inayofuata',
    pending: 'Inasubiri', approved: 'Imeidhinishwa', rejected: 'Imekataliwa', completed: 'Imekamilika', inProgress: 'Inaendelea', paid: 'Imelipwa', unpaid: 'Haijalipwa',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('language') === 'sw' ? 'sw' : 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'sw' ? 'sw' : 'en';
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => translations[language][key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};
