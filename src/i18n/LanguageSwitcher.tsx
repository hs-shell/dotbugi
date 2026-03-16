import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage, type LanguageCode } from '@/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  return (
    <div className="flex items-center gap-2 py-2">
      <Globe size={16} className="text-gray-400 flex-shrink-0" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value as LanguageCode)}
        className="text-sm bg-transparent border border-gray-300 rounded-md px-2 py-1 text-gray-700 outline-none focus:border-slate-400 w-full cursor-pointer"
        aria-label={t('language')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
