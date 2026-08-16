import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1 shadow-sm" aria-label={t('language')}>
      <Languages className="mx-1 h-4 w-4 text-gray-600" aria-hidden="true" />
      <button type="button" onClick={() => setLanguage('en')} className={`rounded px-2 py-1 text-xs font-semibold ${language === 'en' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>EN</button>
      <button type="button" onClick={() => setLanguage('sw')} className={`rounded px-2 py-1 text-xs font-semibold ${language === 'sw' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>SW</button>
    </div>
  );
};
