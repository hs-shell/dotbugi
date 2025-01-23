import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEffect, useMemo, useState } from 'react';
import Bugi from '@/assets/bugi.png';
import Video from './components/Video';
import Assign from './components/Assign';
import Quiz from './components/Quiz';
import { requestData } from '@/lib/fetchCourseData';
import { AssignData, AssignItem, CourseBase, Item, QuizData, QuizItem, TAB_TYPE, VodData, VodItem } from './types';
import { ChevronDown, Filter, RefreshCw, Search } from 'lucide-react';
import PopoverFooter from './components/PopoverFooter';
import { Input } from '@/components/ui/input';
import { isCurrentDateInRange, isWithinSevenDays } from '@/lib/utils';

export default function App() {
  const [courseData, setCourseData] = useState<CourseBase[]>([]);

  const [vodItems, setVodItems] = useState<VodItem[]>([]);
  const [assignItems, setAssignItems] = useState<AssignItem[]>([]);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>(TAB_TYPE.VIDEO);
  const [isOpen, setIsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [vodSortBy, setVodSortBy] = useState<keyof Item>('title');
  const [assignSortBy, setAssignSortBy] = useState<keyof Item>('isCompleted');
  const [quizSortBy, setQuizSortBy] = useState<keyof Item>('title');

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
          await Promise.all(
            courseData.map(async (item) => {
              const result = await requestData(item.courseId);
              const vodItem = result.vodData.filter((data) => {
                return data.items.some((item) => isCurrentDateInRange(item.range!));
              });
              const assignItem = result.assignData.filter((data) => {
                return isWithinSevenDays(data.dueDate!);
              });
              const quizItem = result.quizData.filter((data) => {
                return isWithinSevenDays(data.dueDate!);
              });

              vodItem.forEach((data, index) => {
                setVodItems((prev: VodItem[]) => {
                  return [
                    ...prev,
                    {
                      courseId: item.courseId,
                      title: item.title,
                      prof: item.prof,
                      data: {
                        items: data.items,
                        isAttendance: data.isAttendance,
                      },
                    },
                  ];
                });
              });

              assignItem.forEach((data, index) => {
                setAssignItems((prev: AssignItem[]) => {
                  return [
                    ...prev,
                    {
                      courseId: item.courseId,
                      prof: item.prof,
                      title: item.title,
                      data: { title: data.title, url: data.url, dueDate: data.dueDate, isSubmit: data.isSubmit },
                    },
                  ];
                });
              });

              quizItem.forEach((data, index) => {
                setQuizItems((prev: QuizItem[]) => {
                  return [
                    ...prev,
                    {
                      courseId: item.courseId,
                      prof: item.prof,
                      title: item.title,
                      data: {
                        title: data.title,
                        url: data.url,
                        dueDate: data.dueDate,
                      },
                    },
                  ];
                });
              });
            })
          );
          localStorage.setItem('lastRequestTime', currentTime.toString());
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      })();
    } else {
      console.log('1시간 이내로 요청을 보냈기 때문에, 새로 요청을 보내지 않습니다.');
    }
  }, [courseData]);

  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  const filteredVodData = useMemo(() => {
    return vodItems
      .filter((item) => {
        return (
          searchTerm === '' ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prof.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        switch (vodSortBy) {
          case 'title': {
            return a.title.localeCompare(b.title);
          }
          case 'dueDate': {
            const aRange = a.data?.items[0]?.range;
            const bRange = b.data?.items[0]?.range;
            if (!aRange || !bRange) return 0;
            return new Date(aRange).getTime() - new Date(bRange).getTime();
          }
          default: {
            const aAttendance = a.data.isAttendance;
            const bAttendance = b.data.isAttendance;

            if (aAttendance === false && bAttendance !== false) return -1;
            if (bAttendance === false && aAttendance !== false) return 1;

            return a.title.localeCompare(b.title);
          }
        }
      });
  }, [searchTerm, vodSortBy, vodItems]);

  const filteredAssignData = useMemo(() => {
    return assignItems
      .filter((item) => {
        return (
          searchTerm === '' ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prof.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        switch (assignSortBy) {
          case 'title': {
            return a.title.localeCompare(b.title);
          }
          case 'dueDate': {
            if (!a.data.dueDate || !b.data.dueDate) return 0;
            return new Date(a.data.dueDate).getTime() - new Date(b.data.dueDate).getTime();
          }
          case 'isCompleted': {
            if (a.data.isSubmit === false && b.data.isSubmit !== false) return -1;
            if (b.data.isSubmit === false && a.data.isSubmit !== false) return 1;
            return a.title.localeCompare(b.title);
          }
          default: {
            if (a.data.isSubmit === false && b.data.isSubmit !== false) return -1;
            if (b.data.isSubmit === false && a.data.isSubmit !== false) return 1;
            return a.title.localeCompare(b.title);
          }
        }
      });
  }, [searchTerm, assignSortBy, assignItems]);

  const filteredQuizData = useMemo(() => {
    return quizItems
      .filter((item) => {
        return (
          searchTerm === '' ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prof.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        switch (quizSortBy) {
          case 'title': {
            if (a.title < b.title) return -1;
            if (a.title > b.title) return 1;
            return 0;
          }
          case 'dueDate': {
            if (a.data! < b.data!) return -1;
            if (a.data! > b.data!) return 1;
            return 0;
          }
          default: {
            if (a.title < b.title) return -1;
            if (a.title > b.title) return 1;
            return 0;
          }
        }
      });
  }, [searchTerm, quizSortBy, quizItems]);

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
        <div className="bg-white w-full rounded-xl">
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
          <div className="mb-4 flex px-4 relative">
            <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={`검색`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white rounded-xl border-zinc-300 w-full text-xl h-12 pl-12 pr-4 placeholder-gray-400 font-medium"
            />
          </div>
          <div className="rounded-md hover:bg-zinc-200">
            <Filter className="w-10 h-10 p-2" />
            <ChevronDown className="w-10 h-10 p-1.5" />
          </div>
        </div>
        <div className="grid grid-cols-1 bg-zinc-100 opacity-100 w-full px-3 py-4 overflow-y-auto h-[400px]">
          {activeTab === TAB_TYPE.VIDEO && <Video courseData={filteredVodData} />}
          {activeTab === TAB_TYPE.ASSIGN && <Assign courseData={filteredAssignData} />}
          {activeTab === TAB_TYPE.QUIZ && <Quiz courseData={filteredQuizData} />}
        </div>
        <PopoverFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </PopoverContent>
    </Popover>
  );
}
