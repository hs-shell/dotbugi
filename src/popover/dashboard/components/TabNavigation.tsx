import { NotebookText, VideoIcon, Zap } from 'lucide-react';
import { TAB_TYPE } from '@/types';
import { useTranslation } from 'react-i18next';

interface Prop {
  activeTab: string;
  setActiveTab: (tabType: TAB_TYPE) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: Prop) {
  const { t } = useTranslation('common');
  return (
    <div className="grid w-full grid-cols-3 py-4 z-10">
      <div
        className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.VIDEO ? 'text-blue-700 font-bold' : ''}`}
        onClick={() => setActiveTab(TAB_TYPE.VIDEO)}
      >
        <VideoIcon className="w-8" />
        <span className={`mt-1 text-base`}>{t('vod')}</span>
      </div>
      <div
        className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.ASSIGN ? 'text-blue-700 font-bold' : ''}`}
        onClick={() => setActiveTab(TAB_TYPE.ASSIGN)}
      >
        <NotebookText className="w-7" />
        <span className={`mt-1 text-base`}>{t('assign')}</span>
      </div>
      <div
        className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.QUIZ ? 'text-blue-700 font-bold' : ''}`}
        onClick={() => setActiveTab(TAB_TYPE.QUIZ)}
      >
        <Zap className="w-7" />
        <span className={`mt-1 text-base`}>{t('quiz')}</span>
      </div>
    </div>
  );
}
