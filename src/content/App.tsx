import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import Bugi from '@/assets/bugi.png';
import Video from './components/Video';
import Assign from './components/Assign';
import Quiz from './components/Quiz';
import { requestData } from '@/lib/fetchCourseData';
import { AssignData, CourseData, VodData } from './types';
import { NotebookText, RefreshCw, VideoIcon, Zap } from 'lucide-react';

const TAB_TYPE = {
  VIDEO: 'VIDEO',
  ASSIGN: 'ASSIGN',
  QUIZ: 'QUIZ',
} as const;

export default function App() {
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [fetchedData, setFetchedData] = useState<CourseData[]>([]);
  const [activeTab, setActiveTab] = useState<string>(TAB_TYPE.VIDEO);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!document) return;
    const courses = Array.from(document.querySelectorAll('.course_box'));
    const data = courses
      .map((div) => {
        const a = div.querySelector('a');
        const url = new URL((a as HTMLAnchorElement).href);
        const urlParams = new URLSearchParams(url.search);
        const courseId = urlParams.get('id') || '';
        const titleSection = div.querySelector('.course_link .course-name .course-title');
        const prof = titleSection?.querySelector('p')?.textContent?.trim() || '';
        const title = titleSection?.querySelector('h1, h2, h3')?.textContent?.replace(/new/i, '').trim() || '';
        return { courseId, title, prof };
      })
      .filter((item) => item.courseId !== '' && item.title !== '' && item.prof !== '');
    setCourseData(data);
  }, []);

  useEffect(() => {
    if (!courseData || courseData.length === 0) return;

    // 1시간 이내 요청 제한
    const lastRequestTime = localStorage.getItem('lastRequestTime');
    const currentTime = new Date().getTime();
    const oneHour = 60 * 60 * 1000;

    if (!lastRequestTime || currentTime - parseInt(lastRequestTime, 10) >= 0) {
      (async () => {
        try {
          const updatedData = await Promise.all(
            courseData.map(async (item) => {
              const result = await requestData(item.courseId);
              return { ...item, data: result };
            })
          );
          setFetchedData(updatedData);
          localStorage.setItem('lastRequestTime', currentTime.toString());
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      })();
    } else {
      console.log('1시간 이내로 요청을 보냈기 때문에, 새로 요청을 보내지 않습니다.');
    }
  }, [courseData]);

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <img
          src={Bugi}
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-20 h-20 bg-white border-zinc-500"
        />
      </PopoverTrigger>
      <PopoverContent
        className="bg-white opacity-100 rounded-xl border-none shadow-2xl shadow-zinc-600 px-0 py-0 flex flex-col items-center justify-center w-[300px] h-[400px]"
        side="top"
      >
        <div className="w-full flex items-center justify-between px-4 py-6">
          <div className="items-center justify-center font-bold text-2xl">
            {activeTab === TAB_TYPE.VIDEO
              ? '온라인 강의 목록'
              : activeTab === TAB_TYPE.ASSIGN
                ? '과제 목록'
                : activeTab === TAB_TYPE.QUIZ
                  ? '퀴즈 목록'
                  : '오류'}
          </div>
          <RefreshCw className="rounded-md w-10 h-10 p-1.5 hover:bg-zinc-200" />
        </div>
        <div className="grid grid-cols-1 bg-zinc-100 opacity-100 w-full px-3 py-4 overflow-y-auto h-[400px]">
          {activeTab === TAB_TYPE.VIDEO && <Video courseData={fetchedData} />}
          {activeTab === TAB_TYPE.ASSIGN && <Assign courseData={fetchedData} />}
          {activeTab === TAB_TYPE.QUIZ && <Quiz courseData={fetchedData} />}
        </div>
        <div className="grid w-full grid-cols-3 py-2">
          <div
            className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.VIDEO ? 'text-blue-700 font-bold' : ''}`}
            onClick={() => setActiveTab(TAB_TYPE.VIDEO)}
          >
            <VideoIcon className="w-8" />
            <span className={`mt-1 text-sm`}>강의</span>
          </div>
          <div
            className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.ASSIGN ? 'text-blue-700 font-bold' : ''}`}
            onClick={() => setActiveTab(TAB_TYPE.ASSIGN)}
          >
            <NotebookText className="w-7" />
            <span className={`mt-1 text-sm`}>과제</span>
          </div>
          <div
            className={`flex flex-col items-center justify-center cursor-pointer font-semibold ${activeTab === TAB_TYPE.QUIZ ? 'text-blue-700 font-bold' : ''}`}
            onClick={() => setActiveTab(TAB_TYPE.QUIZ)}
          >
            <Zap className="w-7" />
            <span className={`mt-1 text-sm`}>퀴즈</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
