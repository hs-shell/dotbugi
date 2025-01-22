import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import Bugi from '@/assets/bugi.png';
import { TabsList, Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import Video from './components/Video';
import Homework from './components/Homework';
import Quiz from './components/Quiz';
import { getAssignmentLink, getQuizLink, getVodLink } from '@/constants/constant';
import { requestData } from '@/api/api';

const TAB_TYPE = {
  VIDEO: 'VIDEO',
  HOMEWORK: 'HOMEWORK',
  QUIZ: 'QUIZ',
} as const;

export default function App() {
  const [courseId, setCourseId] = useState<string[]>();

  useEffect(() => {
    if (!document) return;
    const ids = Array.from(document.querySelectorAll('.course_box'))
      .map((div) => {
        const a = div.querySelector('a');
        const url = new URL((a as HTMLAnchorElement).href);
        const urlParams = new URLSearchParams(url.search);
        return urlParams.get('id');
      })
      .filter((id) => id !== null);
    setCourseId(ids);
  }, []);

  useEffect(() => {
    if (!courseId || courseId.length === 0) return;

    const lastRequestTime = localStorage.getItem('lastRequestTime');
    const currentTime = new Date().getTime();

    if (!lastRequestTime || currentTime - parseInt(lastRequestTime) >= 0) {
      courseId.map((id) => {
        requestData(id);
      });
      localStorage.setItem('lastRequestTime', currentTime.toString());
    } else {
      console.log('1시간 이내로 요청을 보냈기 때문에, 새로 요청을 보내지 않습니다.');
    }
  }, [courseId]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <img src={Bugi} className="rounded-full w-20 h-20 bg-white border-zinc-500" />
      </PopoverTrigger>
      <PopoverContent className="bg-zinc-50 opacity-100" side="top">
        <Tabs defaultValue={TAB_TYPE.VIDEO}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={TAB_TYPE.VIDEO}>강의</TabsTrigger>
            <TabsTrigger value={TAB_TYPE.HOMEWORK}>과제</TabsTrigger>
            <TabsTrigger value={TAB_TYPE.QUIZ}>퀴즈</TabsTrigger>
          </TabsList>
          <TabsContent value={TAB_TYPE.VIDEO} forceMount className="data-[state=inactive]:hidden">
            <Video />
          </TabsContent>
          <TabsContent value={TAB_TYPE.HOMEWORK} forceMount className="data-[state=inactive]:hidden">
            <Homework />
          </TabsContent>
          <TabsContent value={TAB_TYPE.QUIZ} forceMount className="data-[state=inactive]:hidden">
            <Quiz />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
