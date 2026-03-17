import { NotebookText, VideoIcon, Zap } from 'lucide-react';
import { TAB_TYPE } from '@/types';
import { useTranslation } from 'react-i18next';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tabType: TAB_TYPE) => void;
  hasIncomplete?: Partial<Record<TAB_TYPE, boolean>>;
}

export default function TabNavigation({ activeTab, setActiveTab, hasIncomplete }: TabNavigationProps) {
  const { t } = useTranslation('common');

  const tabs = [
    { type: TAB_TYPE.VIDEO, icon: <VideoIcon className="w-8" />, label: t('vod') },
    { type: TAB_TYPE.ASSIGN, icon: <NotebookText className="w-7" />, label: t('assign') },
    { type: TAB_TYPE.QUIZ, icon: <Zap className="w-7" />, label: t('quiz') },
  ];

  return (
    <div className="grid w-full grid-cols-3 py-4 z-10">
      {tabs.map(({ type, icon, label }) => (
        <div
          key={type}
          className={`relative flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === type ? 'text-blue-700 font-bold' : ''}`}
          onClick={() => setActiveTab(type)}
        >
          <div className="relative">
            {icon}
            {hasIncomplete?.[type] && (
              <span className="absolute -top-0.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </div>
          <span className="mt-1 text-base">{label}</span>
        </div>
      ))}
    </div>
  );
}
