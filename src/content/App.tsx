import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEffect, useMemo, useState } from 'react';
import Bugi from '@/assets/bugi.png';
import Close from '@/assets/close.png';
import Video from './components/Video';
import Assign from './components/Assign';
import Quiz from './components/Quiz';
import { requestData } from '@/lib/fetchCourseData';
import { AssignItem, CourseBase, Item, QuizItem, TAB_TYPE, VodItem } from './types';
import { ChevronDown, Filter, RefreshCw, Search } from 'lucide-react';
import PopoverFooter from './components/PopoverFooter';
import { isCurrentDateByDate, isCurrentDateInRange, isWithinSevenDays } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { loadDataFromStorage, saveDataToStorage } from './storage';

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

  const [refreshTime, setRefreshTime] = useState<string | null>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (remainingTime >= 60) {
      updateData();
    } else {
      timer = setTimeout(() => {
        setRemainingTime((prev) => prev + 1);
      }, 60 * 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [remainingTime]);

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

    if (lastRequestTime) setRefreshTime(new Date(parseInt(lastRequestTime, 10)).toLocaleTimeString());

    if (!lastRequestTime || currentTime - parseInt(lastRequestTime, 10) >= oneHour) {
      setIsPending(true);
      updateData();
    } else {
      const minutes = (currentTime - parseInt(lastRequestTime, 10)) / (60 * 1000);
      setRemainingTime(minutes);
      loadDataFromStorage('vod', (data) => {
        setVodItems(
          (data as VodItem[]).filter((vod) => {
            return !vod.data.items.some((item) => {
              isCurrentDateInRange(item.range);
            });
          })
        );
      });
      loadDataFromStorage('assign', (data) => {
        setAssignItems(
          (data as AssignItem[]).filter((assign) => {
            return isCurrentDateByDate(assign.data.dueDate);
          })
        );
      });
      loadDataFromStorage('quiz', (data) => {
        setQuizItems(
          (data as QuizItem[]).filter((quiz) => {
            return isCurrentDateByDate(quiz.data.dueDate);
          })
        );
      });
    }
  }, [courseData]);

  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  const updateData = async () => {
    try {
      const currentTime = new Date().getTime();
      setVodItems([]);
      setAssignItems([]);
      setQuizItems([]);

      const tempVodItems: VodItem[] = [];
      const tempAssignItems: AssignItem[] = [];
      const tempQuizItems: QuizItem[] = [];

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
            tempVodItems.push({
              courseId: item.courseId,
              title: item.title,
              prof: item.prof,
              subject: data.subject,
              data: {
                items: data.items,
                isAttendance: data.isAttendance,
              },
            });
          });

          assignItem.forEach((data, index) => {
            tempAssignItems.push({
              courseId: item.courseId,
              prof: item.prof,
              title: item.title,
              subject: data.subject,
              data: { title: data.title, url: data.url, dueDate: data.dueDate, isSubmit: data.isSubmit },
            });
          });

          quizItem.forEach((data, index) => {
            tempQuizItems.push({
              courseId: item.courseId,
              prof: item.prof,
              title: item.title,
              subject: data.subject,
              data: {
                title: data.title,
                url: data.url,
                dueDate: data.dueDate,
              },
            });
          });
        })
      );

      setVodItems(tempVodItems);
      setAssignItems(tempAssignItems);
      setQuizItems(tempQuizItems);

      saveDataToStorage('vod', tempVodItems);
      saveDataToStorage('assign', tempAssignItems);
      saveDataToStorage('quiz', tempQuizItems);

      setRefreshTime(new Date(currentTime).toLocaleTimeString());

      setRemainingTime(0);
      localStorage.setItem('lastRequestTime', currentTime.toString());
      setIsPending(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
      <PopoverTrigger asChild className="transition-all duration-1000">
        {isOpen ? (
          <img
            src={Close}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full w-20 h-20 bg-white border-zinc-500 shadow-xl"
          />
        ) : (
          <img
            src={Bugi}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full w-20 h-20 bg-white border-zinc-500 shadow-xl"
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        className="bg-white opacity-100 rounded-3xl border-none shadow-2xl shadow-zinc-600 px-0 py-0 flex flex-col items-center justify-center w-[350px] h-[550px]"
        side="top"
      >
        <div className="bg-white w-full rounded-3xl">
          <div className="w-full flex items-center justify-between px-5 pt-8 pb-6">
            <div className="items-center justify-center font-bold text-3xl">
              {activeTab === TAB_TYPE.VIDEO
                ? '온라인 강의 목록'
                : activeTab === TAB_TYPE.ASSIGN
                  ? '과제 목록'
                  : activeTab === TAB_TYPE.QUIZ
                    ? '퀴즈 목록'
                    : '오류'}
            </div>
            <div className="flex justify-center items-center">
              {/* <span className="text-sm text-zinc-400 px-1">{refreshTime}</span> */}
              <span
                className={`text-sm px-1 ${Math.round(remainingTime) >= 30 ? 'text-amber-500 font-semibold' : 'text-zinc-400'}`}
              >
                {Math.round(remainingTime)}분 전
              </span>
              <RefreshCw
                className="rounded-md w-10 h-10 p-1.5 hover:bg-zinc-200"
                onClick={() => {
                  if (isPending) return;
                  setIsPending(true);
                  updateData();
                }}
              />
            </div>
          </div>
          <div className="mb-4 flex px-5 relative py-0">
            <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`검색`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={false}
              className="bg-zinc-50 rounded-xl border border-zinc-300 w-full text-lg h-12 pl-12 pr-4 placeholder-gray-400 font-medium py-0 outline-none focus:ring-0 focus:border-zinc-300 focus:bg-slate-50 transition-all duration-200"
            />
          </div>
          <div className="flex rounded-md mb-1">
            {/* <div className="pl-2 flex overflow-x-auto max-w-full rounded-md space-x-1"></div> */}
            <div className="flex justify-self-end rounded-lg gap-1 hover:bg-zinc-100 transition-all duration-200 mb-2 p-2 pl-3">
              <Filter className="w-6 h-6 p-0" />
              <ChevronDown className="w-6 h-6 p-0" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 bg-slate-100 opacity-100 w-full px-5 py-4 overflow-y-scroll h-[400px]">
          {isPending ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div>
              {activeTab === TAB_TYPE.VIDEO && <Video courseData={filteredVodData} />}
              {activeTab === TAB_TYPE.ASSIGN && <Assign courseData={filteredAssignData} />}
              {activeTab === TAB_TYPE.QUIZ && <Quiz courseData={filteredQuizData} />}
            </div>
          )}
        </div>
        <PopoverFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </PopoverContent>
    </Popover>
  );
}
