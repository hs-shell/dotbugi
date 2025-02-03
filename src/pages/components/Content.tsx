import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useState } from 'react';
import { CustomTabs } from './CustomTabs';
import VodContent from './VodContent';
import { Toaster } from '@/components/ui/toaster';

interface ContentProps {
  title: string;
}

export enum TYPES {
  vod = '강의',
  assignment = '과제',
  quiz = '퀴즈',
}

export function Content(props: ContentProps) {
  const [activeTab, setActiveTab] = useState<TYPES>(TYPES.vod);
  const date = new Date();
  const formattedDate = date.toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const tabs = Object.values(TYPES);

  return (
    <>
      <div className="mt-6 mb-4">
        <div className="p-0 m-0 lg:hidden">
          <CustomTabs tabs={tabs} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TYPES)} />
        </div>
      </div>
      <div className="flex flex-col overflow-y-scroll h-screen md:flex-row md:overflow-hidden gap-6">
        <Card className="w-full md:w-8/12 rounded-xl min-h-[80lvh] max-h-[80lvh] bg-white zinc-900 p-6 shadow-none overflow-y-auto">
          <CardHeader className="p-0">
            <div className="flex justify-between items-center p-0">
              <p className="text-2xl font-bold">{activeTab} 현황</p>
              <p className="font-semibold text-slate-500">{formattedDate}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">{activeTab === TYPES.vod && <VodContent />}</CardContent>
        </Card>
        <div className="w-full md:w-4/12 mt-0">
          <Card className="rounded-xl min-h-[80lvh] bg-white zinc-800 px-6 pt-6 shadow-none">
            <CardHeader className="p-0">
              <div className="flex justify-between items-center p-0">
                <p className="text-2xl font-bold">알림</p>
              </div>
            </CardHeader>
            <CardContent className="p-0 py-4">
              <hr className="border-slate-200 m-1" />
              <div className="flex w-full border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 2xl:items-start rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80"
                  alt="profile image"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="w-full pl-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="font-medium text-slate-900 dark:text-white">Stephanie</div>
                    <div className="flex h-7 w-7 cursor-pointer items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-900 dark:text-white"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="my-2 text-sm text-slate-500 dark:text-slate-400">
                    I got your first assignment. It was quite good. 🥳 We can continue with the next assignment.
                  </p>
                  <p className="text-right text-sm text-slate-500 dark:text-slate-400">Dec, 12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
