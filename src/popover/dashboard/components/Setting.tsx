import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage, type LanguageCode } from '@/i18n';
import { Globe, Github, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GoogleCalendar from '@/assets/calendar.png';
import GmailIcon from '@/assets/gmail.png';
import { downloadLogs } from '@/lib/logger';

const CONTACT_EMAIL = 'hsu.dotbugi@gmail.com';
const KAKAO_LINK = 'https://open.kakao.com/o/sZBnxllh';
const CALENDAR_LINK = 'https://calendar.google.com/calendar';

interface HiddenTaskInfo {
  url: string;
  title: string;
  courseTitle: string;
}

interface SettingProps {
  isCalendarConnected: boolean;
  onCalendarLogin: () => void;
  onCalendarLogout: () => void;
  hiddenTasks?: HiddenTaskInfo[];
  onUnhideTask?: (url: string) => void;
}

export default function Setting({
  isCalendarConnected,
  onCalendarLogin,
  onCalendarLogout,
  hiddenTasks,
  onUnhideTask,
}: SettingProps) {
  const { i18n, t } = useTranslation('common');

  return (
    <div className="w-full h-full flex flex-col gap-3 py-2">
      {/* Google Calendar 배너 */}
      <Card
        className="bg-white rounded-2xl w-full border-0 shadow-none px-4 py-4 cursor-pointer"
        onClick={() => window.open(CALENDAR_LINK, '_blank')}
      >
        <div className="flex items-center gap-3 mb-3">
          <img src={GoogleCalendar} className="w-10 h-10" alt="Google Calendar" />
          <div className="font-bold text-xl text-zinc-800">{t('calendar.bannerTitle')}</div>
        </div>
        <p className="text-base text-zinc-500 leading-relaxed mb-4">{t('calendar.bannerDesc')}</p>
        {isCalendarConnected ? (
          <Button
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onCalendarLogout();
            }}
          >
            {t('calendar.logout')}
          </Button>
        ) : (
          <Button
            className="w-full h-14 text-lg font-semibold rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onCalendarLogin();
            }}
          >
            {t('calendar.login')}
          </Button>
        )}
      </Card>

      {/* 언어 설정 */}
      <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-1.5">
        <Select value={i18n.language} onValueChange={(value) => changeLanguage(value as LanguageCode)}>
          <SelectTrigger className="w-full h-14 border-0 shadow-none rounded-2xl px-4 py-3 gap-x-3 cursor-pointer bg-white hover:bg-zinc-100 transition-colors duration-500 focus:ring-0 [&>svg:last-child]:hidden">
            <Globe className="w-5 h-5 text-zinc-500 flex-shrink-0" />
            <span className="flex-1 text-lg font-semibold text-zinc-600 text-left">{t('language')}</span>
            <span className="text-lg">
              <SelectValue />
            </span>
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

      {/* 문의하기 */}
      <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-1.5">
        <div className="flex items-center w-full h-14 rounded-xl px-4 py-3 gap-x-2">
          <span className="flex-1 text-lg font-semibold text-zinc-600">{t('contact')}</span>
          <div className="flex items-center gap-3">
            <a
              href={KAKAO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FEE500] transition-transform duration-200 hover:scale-[1.2]"
              aria-label="KakaoTalk"
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#3C1E1E">
                <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.62 1.74 4.93 4.38 6.28l-1.12 4.13c-.08.3.27.54.52.36l4.9-3.28c.43.04.87.06 1.32.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
              </svg>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 transition-transform duration-200 hover:scale-[1.2]"
              aria-label="Gmail"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={GmailIcon} className="w-6 h-6 object-contain" alt="Gmail" />
            </a>
          </div>
        </div>
      </Card>

      {/* 로그 다운로드 */}
      <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-1.5">
        <button
          onClick={() => downloadLogs()}
          className="flex items-center w-full h-14 rounded-2xl px-4 py-3 gap-x-3 cursor-pointer bg-white hover:bg-zinc-100 transition-colors duration-500"
        >
          <Download className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <span className="flex-1 text-lg font-semibold text-zinc-600 text-left">{t('downloadLogs')}</span>
        </button>
      </Card>

      {/* 숨긴 태스크 */}
      {hiddenTasks && hiddenTasks.length > 0 && (
        <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-4">
          <span className="text-lg font-semibold text-zinc-600 px-2.5">{t('hide.title')}</span>
          <div className="space-y-2 mt-3">
            {hiddenTasks.map((task) => (
              <div
                key={task.url}
                className="flex items-center justify-between gap-2 px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-medium text-zinc-700 truncate">{task.courseTitle}</div>
                  <div className="text-base text-zinc-500 truncate">{task.title}</div>
                </div>
                <button
                  onClick={() => onUnhideTask?.(task.url)}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-300 hover:bg-zinc-500 transition-colors"
                  title={t('hide.unhide')}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* GitHub Star 배너 */}
      <GitHubStarBanner />
    </div>
  );
}

function GitHubStarBanner() {
  const { t } = useTranslation('common');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="bg-white rounded-2xl w-full border-0 shadow-none px-1.5 py-1.5">
      <div
        onClick={() => window.open('https://github.com/hs-shell/dotbugi', '_blank')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col items-center text-center w-full rounded-2xl px-4 py-4 cursor-pointer bg-white hover:bg-zinc-100 transition-colors duration-500 group"
      >
        <div className="flex items-center justify-center mb-2 space-x-2">
          <Github size={26} className="text-zinc-600 group-hover:text-zinc-900" />
          <div className="relative w-6 h-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 text-amber-500 group-hover:text-amber-600"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <motion.svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute inset-0 text-amber-500 group-hover:text-amber-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ transformOrigin: 'center' }}
              />
            </motion.svg>
          </div>
        </div>
        <p className="text-lg font-semibold text-zinc-600 group-hover:text-zinc-900">{t('github.likeProject')}</p>
        <p className="text-base text-zinc-500 group-hover:text-zinc-700 mt-1">{t('github.starOnGithub')}</p>
      </div>
    </Card>
  );
}
