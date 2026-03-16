import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage, type LanguageCode } from '@/i18n';
import { Globe, Mail, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CONTACT_EMAIL = 'hsu.dotbugi@gmail.com';
const KAKAO_LINK = 'https://open.kakao.com/o/sExample';

export default function Setting() {
  const { i18n, t } = useTranslation('common');

  return (
    <div className="w-full h-full flex flex-col gap-3 py-2">
      <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-1.5">
        <Select value={i18n.language} onValueChange={(value) => changeLanguage(value as LanguageCode)}>
          <SelectTrigger className="w-full h-16 border-0 shadow-none rounded-xl px-4 py-3 gap-x-3 cursor-pointer bg-white hover:bg-zinc-100 transition-colors duration-500 focus:ring-0">
            <Globe className="w-6 h-6 text-zinc-500 flex-shrink-0" />
            <span className="flex-1 text-xl font-semibold text-zinc-600 text-left">{t('language')}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned" className="text-xl rounded-xl min-w-0 w-[140px]">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-xl py-2.5 cursor-pointer">
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-1.5">
        <div className="flex items-center w-full h-16 rounded-xl px-4 py-3 gap-x-2 cursor-pointer bg-white hover:bg-zinc-100 transition-colors duration-500">
          <span className="text-xl font-semibold text-zinc-600">{t('contact')}</span>
          <span className="flex-1" />
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-zinc-400 hover:text-red-500 transition-colors duration-200"
              aria-label="Gmail"
            >
              <Mail className="w-7 h-7" />
            </a>
            <a
              href={KAKAO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-yellow-500 transition-colors duration-200"
              aria-label="KakaoTalk"
            >
              <MessageCircle className="w-7 h-7" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
