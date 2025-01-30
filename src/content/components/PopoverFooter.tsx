import { NotebookText, VideoIcon, Zap } from 'lucide-react';
import { TAB_TYPE } from '../types';

interface Prop {
  activeTab: string;
  setActiveTab: (tabType: TAB_TYPE) => void;
}

export default function PopoverFooter({ activeTab, setActiveTab }: Prop) {
  return (
    <div className="grid w-full grid-cols-3 py-4 z-10">
      <div
        className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.VIDEO ? 'text-blue-700 font-bold' : ''}`}
        onClick={() => setActiveTab(TAB_TYPE.VIDEO)}
      >
        <VideoIcon className="w-8" />
        <span className={`mt-1 text-base`}>강의</span>
      </div>
      <div
        className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.ASSIGN ? 'text-blue-700 font-bold' : ''}`}
        onClick={() => setActiveTab(TAB_TYPE.ASSIGN)}
      >
        <NotebookText className="w-7" />
        <span className={`mt-1 text-base`}>과제</span>
      </div>
      <div
        className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.QUIZ ? 'text-blue-700 font-bold' : ''}`}
        onClick={() => setActiveTab(TAB_TYPE.QUIZ)}
      >
        <Zap className="w-7" />
        <span className={`mt-1 text-base`}>퀴즈</span>
      </div>
    </div>
  );
}
