import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEffect, useMemo, useState } from 'react';
import Bugi from '@/assets/bugi.png';
import Close from '@/assets/close.png';
import { Assign, Filters, Quiz, TAB_TYPE, Vod } from './types';
import { ListFilter, RefreshCw, Search } from 'lucide-react';
import filter from '@/assets/filter.svg';
import PopoverFooter from './components/PopoverFooter';
import { Spinner } from '@/components/ui/spinner';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { useGetCourses } from '@/hooks/useGetCourse';
import { requestData } from '@/lib/fetchCourseData';
import Video from './components/Video';
import Assignment from './components/Assignment';
import QuizTab from './components/QuizTab';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import FilterItem from './components/FilterItem';
import FilterBadge from './components/FilterBadge';

export default function App() {
  const { courses } = useGetCourses();

  const [vods, setVods] = useState<Vod[]>([]);
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [quizes, setQuizes] = useState<Quiz[]>([]);

  // activeTab의 타입을 TAB_TYPE으로 지정
  const [activeTab, setActiveTab] = useState<TAB_TYPE>(TAB_TYPE.VIDEO);

  const [isOpen, setIsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [vodSortBy, setVodSortBy] = useState<keyof Vod>('isAttendance');
  const [assignSortBy, setAssignSortBy] = useState<keyof Assign>('isSubmit');
  const [quizSortBy, setQuizSortBy] = useState<keyof Quiz>('dueDate');

  const [refreshTime, setRefreshTime] = useState<string | null>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태 관리 - Record을 사용하여 TAB_TYPE을 키로 지정
  const [filters, setFilters] = useState<Record<TAB_TYPE, Filters>>({
    VIDEO: { courseTitles: [], attendanceStatuses: [] },
    ASSIGN: { courseTitles: [], submitStatuses: [] },
    QUIZ: { courseTitles: [] },
  });

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
    if (!courses || courses.length === 0) return;

    const lastRequestTime = localStorage.getItem('lastRequestTime');
    const currentTime = new Date().getTime();
    const oneHour = 60 * 60 * 1000;

    if (lastRequestTime) setRefreshTime(new Date(parseInt(lastRequestTime, 10)).toLocaleTimeString());
    updateData();
    if (!lastRequestTime || currentTime - parseInt(lastRequestTime, 10) >= oneHour) {
      setIsPending(true);
      updateData();
    } else {
      const minutes = (currentTime - parseInt(lastRequestTime, 10)) / (60 * 1000);
      setRemainingTime(minutes);
      loadDataFromStorage('vod', (data) => {
        setVods((data as Vod[]).filter((vod) => isCurrentDateInRange(vod.range)));
      });
      loadDataFromStorage('assign', (data) => {
        setAssigns((data as Assign[]).filter((assign) => isCurrentDateByDate(assign.dueDate)));
      });
      loadDataFromStorage('quiz', (data) => {
        setQuizes((data as Quiz[]).filter((quiz) => isCurrentDateByDate(quiz.dueDate)));
      });
    }
  }, [courses]);

  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  useEffect(() => {
    setSearchTerm('');
    setIsFilterOpen(false);
  }, [activeTab]);

  const updateData = async () => {
    try {
      setIsPending(true);
      const currentTime = new Date().getTime();
      setVods([]);
      setAssigns([]);
      setQuizes([]);

      const tempVods: Vod[] = [];
      const tempAssigns: Assign[] = [];
      const tempQuizes: Quiz[] = [];

      await Promise.all(
        courses.map(async (course) => {
          const result = await requestData(course.courseId);

          result.vodDataArray.forEach((vodData) => {
            // if (isCurrentDateInRange(vodData.range)) {
            result.vodAttendanceArray.forEach((vodAttendanceData) => {
              if (vodAttendanceData.title === vodData.title && vodAttendanceData.week === vodData.week) {
                tempVods.push({
                  courseId: course.courseId,
                  prof: course.prof,
                  courseTitle: course.courseTitle,
                  week: vodAttendanceData.week,
                  title: vodAttendanceData.title,
                  isAttendance: vodAttendanceData.isAttendance,
                  weeklyAttendance: vodAttendanceData.weeklyAttendance,
                  length: vodData.length,
                  range: vodData.range,
                  subject: vodData.subject,
                  url: vodData.url,
                });
              }
            });
            // }
          });

          result.assignDataArray.forEach((assignData) => {
            // if (isCurrentDateByDate(assignData.dueDate)) {
            tempAssigns.push({
              courseId: course.courseId,
              prof: course.prof,
              courseTitle: course.courseTitle,
              subject: assignData.subject,
              title: assignData.title,
              dueDate: assignData.dueDate,
              isSubmit: assignData.isSubmit,
              url: assignData.url,
            });
            // }
          });

          result.quizDataArray.forEach((quizData) => {
            // if (isCurrentDateByDate(quizData.dueDate)) {
            tempQuizes.push({
              courseId: course.courseId,
              prof: course.prof,
              courseTitle: course.courseTitle,
              subject: quizData.subject,
              title: quizData.title,
              dueDate: quizData.dueDate,
              url: quizData.url,
            });
            // }
          });
        })
      );

      setVods(tempVods);
      setAssigns(tempAssigns);
      setQuizes(tempQuizes);

      saveDataToStorage('vod', tempVods);
      saveDataToStorage('assign', tempAssigns);
      saveDataToStorage('quiz', tempQuizes);

      setRefreshTime(new Date(currentTime).toLocaleTimeString());

      setRemainingTime(0);
      localStorage.setItem('lastRequestTime', currentTime.toString());
      setIsPending(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsPending(false);
    }
  };

  // 필터 옵션 추출
  const courseTitlesMap = useMemo(
    () => ({
      VIDEO: Array.from(new Set(vods.map((vod) => vod.courseTitle))),
      ASSIGN: Array.from(new Set(assigns.map((assign) => assign.courseTitle))),
      QUIZ: Array.from(new Set(quizes.map((quiz) => quiz.courseTitle))),
    }),
    [vods, assigns, quizes]
  );

  const attendanceOptions = ['출석', '결석']; // string[]
  const submitOptions = [
    { label: '제출완료', value: true },
    { label: '제출필요', value: false },
  ]; // { label: string, value: boolean }[]

  // 필터 적용
  const filteredVods = useMemo(() => {
    let data = vods;

    const { courseTitles, attendanceStatuses } = filters[activeTab];

    if (courseTitles.length > 0) {
      data = data.filter((vod) => courseTitles.includes(vod.courseTitle));
    }

    if (attendanceStatuses && attendanceStatuses.length > 0) {
      data = data.filter((vod) => {
        const status = vod.isAttendance.toLowerCase().trim() === 'o' ? '출석' : '결석';
        return attendanceStatuses.includes(status);
      });
    }

    if (searchTerm !== '') {
      data = data.filter(
        (item) =>
          item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prof.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data.sort((a, b) => {
      const attendanceA = a.isAttendance.toLowerCase().trim() === 'o';
      const attendanceB = b.isAttendance.toLowerCase().trim() === 'o';
      if (attendanceA !== attendanceB) {
        return attendanceA ? -1 : 1;
      }

      switch (vodSortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return a.range.localeCompare(b.range);
      }
    });
  }, [vods, searchTerm, vodSortBy, filters, activeTab]);

  const filteredAssigns = useMemo(() => {
    let data = assigns;

    const { courseTitles, submitStatuses } = filters[activeTab];

    if (courseTitles.length > 0) {
      data = data.filter((assign) => courseTitles.includes(assign.courseTitle));
    }

    if (submitStatuses && submitStatuses.length > 0) {
      data = data.filter((assign) => submitStatuses.includes(assign.isSubmit));
    }

    if (searchTerm !== '') {
      data = data.filter(
        (item) =>
          item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prof.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data.sort((a, b) => {
      if (a.isSubmit !== b.isSubmit) {
        return a.isSubmit ? -1 : 1;
      }

      switch (assignSortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return a.dueDate.localeCompare(b.dueDate);
      }
    });
  }, [assigns, searchTerm, assignSortBy, filters, activeTab]);

  const filteredQuizes = useMemo(() => {
    let data = quizes;

    const { courseTitles } = filters[activeTab];

    if (courseTitles.length > 0) {
      data = data.filter((quiz) => courseTitles.includes(quiz.courseTitle));
    }

    if (searchTerm !== '') {
      data = data.filter(
        (item) =>
          item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.prof.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data.sort((a, b) => {
      switch (quizSortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return a.dueDate.localeCompare(b.dueDate);
      }
    });
  }, [quizes, searchTerm, quizSortBy, filters, activeTab]);

  // Vods용 필터 핸들러
  const handleAttendanceFilterChange = (status: string) => {
    setFilters((prev) => {
      const current = prev[activeTab].attendanceStatuses || [];
      const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status];
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          attendanceStatuses: updated,
        },
      };
    });
  };

  // Assigns용 필터 핸들러
  const handleSubmitFilterChange = (isSubmit: boolean) => {
    setFilters((prev) => {
      const current = prev[activeTab].submitStatuses || [];
      const updated = current.includes(isSubmit) ? current.filter((s) => s !== isSubmit) : [...current, isSubmit];
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          submitStatuses: updated,
        },
      };
    });
  };

  // CourseTitle 필터 핸들러
  const handleCourseTitleChange = (courseTitle: string) => {
    setFilters((prev) => {
      const current = prev[activeTab].courseTitles;
      const updated = current.includes(courseTitle)
        ? current.filter((title) => title !== courseTitle)
        : [...current, courseTitle];
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          courseTitles: updated,
        },
      };
    });
  };

  const FilterComponent = () => {
    const currentFilters = filters[activeTab];

    return (
      <div className="space-y-3 my-4">
        <div>
          <div className="space-y-3">
            {courseTitlesMap[activeTab].map((courseTitle) => (
              <FilterItem
                key={courseTitle}
                id={`course-${courseTitle}`}
                label={courseTitle}
                checked={currentFilters.courseTitles.includes(courseTitle)} // 이미 boolean임
                onChange={() => handleCourseTitleChange(courseTitle)}
              />
            ))}
          </div>
        </div>

        {activeTab === 'VIDEO' && (
          <div>
            <div className="space-y-3">
              {attendanceOptions.map((option) => (
                <FilterItem
                  key={`attendance-${option}`}
                  id={`attendance-${option}`}
                  label={option}
                  checked={currentFilters.attendanceStatuses?.includes(option) ?? false}
                  onChange={() => handleAttendanceFilterChange(option)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ASSIGN' && (
          <div>
            <div className="space-y-3">
              {submitOptions.map((option) => (
                <FilterItem
                  key={`submit-${option.value}`}
                  id={`submit-${option.value}`}
                  label={option.label}
                  checked={currentFilters.submitStatuses?.includes(option.value) ?? false}
                  onChange={() => handleSubmitFilterChange(option.value)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isFilterSet = useMemo(() => {
    const currentFilters = filters[activeTab];
    const { courseTitles, attendanceStatuses, submitStatuses } = currentFilters;
    return (
      (courseTitles && courseTitles.length > 0) ||
      (attendanceStatuses && attendanceStatuses.length > 0) ||
      (submitStatuses && submitStatuses.length > 0)
    );
  }, [filters, activeTab]);

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      [activeTab]: {
        courseTitles: [],
        ...(activeTab === 'VIDEO' ? { attendanceStatuses: [] } : {}),
        ...(activeTab === 'ASSIGN' ? { submitStatuses: [] } : {}),
      },
    }));
  };

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild className="transition-all duration-1000">
        {isOpen ? (
          <img
            src={Close}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full w-20 h-20 bg-white border-zinc-500 shadow-xl cursor-pointer"
            alt="Close"
          />
        ) : (
          <img
            src={Bugi}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full w-20 h-20 bg-white border-zinc-500 shadow-xl cursor-pointer"
            alt="Open"
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        className="bg-white opacity-100 rounded-3xl border-none shadow-2xl shadow-zinc-600 px-0 py-0 flex flex-col items-center justify-center w-[350px] h-[550px]"
        side="top"
      >
        <div className="bg-white w-full rounded-3xl z-10">
          <div className="w-full flex items-center justify-between px-5 pt-8 pb-6">
            <div className="items-center justify-center font-bold text-3xl">
              {activeTab === 'VIDEO'
                ? '온라인 강의 목록'
                : activeTab === 'ASSIGN'
                  ? '과제 목록'
                  : activeTab === 'QUIZ'
                    ? '퀴즈 목록'
                    : '오류'}
            </div>
            <div className="flex justify-center items-center">
              {/* <span className="text-sm text-zinc-400 px-1">{refreshTime}</span> */}
              <span
                className={`text-sm px-1 ${
                  Math.round(remainingTime) >= 30 ? 'text-amber-500 font-semibold' : 'text-zinc-400'
                }`}
              >
                {Math.round(remainingTime)}분 전
              </span>
              <button
                className="flex rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 p-2 ml-1"
                onClick={() => {
                  if (isPending) return;
                  setIsPending(true);
                  updateData();
                }}
              >
                <RefreshCw className="w-8 h-8 p-0" />
              </button>
            </div>
          </div>
          <div className="mb-2 flex px-5 relative py-0">
            <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`검색`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={true}
              className="bg-zinc-50 rounded-xl border border-zinc-300 w-full text-lg h-12 pl-12 pr-4 placeholder-gray-400 font-medium py-0 outline-none focus:ring-0 focus:border-zinc-300 focus:bg-slate-50 transition-all duration-200"
            />
          </div>
          <div className="flex w-full items-center pl-5 my-1">
            <div className="whitespace-nowrap space-x-2 overflow-x-auto flex-1 min-w-0 flex overscroll-none">
              {filters[activeTab].courseTitles.map((title) => (
                <FilterBadge key={`course-${title}`} label={title} onRemove={() => handleCourseTitleChange(title)} />
              ))}
              {activeTab === 'VIDEO' &&
                filters[activeTab].attendanceStatuses &&
                filters[activeTab].attendanceStatuses.map((status) => (
                  <FilterBadge
                    key={`attendance-${status}`}
                    label={status}
                    onRemove={() => handleAttendanceFilterChange(status)}
                  />
                ))}
              {activeTab === 'ASSIGN' &&
                filters[activeTab].submitStatuses &&
                filters[activeTab].submitStatuses.map((status) => (
                  <FilterBadge
                    key={`submit-${status}`}
                    label={status ? '제출완료' : '제출필요'}
                    onRemove={() => handleSubmitFilterChange(status)}
                  />
                ))}
            </div>

            {/* 고정된 필터 아이콘 영역 */}
            <div className="flex flex-shrink-0 ml-2">
              <Popover open={isFilterOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="flex justify-self-end rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 mb-2 mr-5 ml-2 p-2"
                  >
                    {isFilterSet ? (
                      <img src={filter} className="w-9 h-9 p-0" alt="필터 설정됨" />
                    ) : (
                      <ListFilter className="w-9 h-9 p-0" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 shadow-md rounded-xl p-4 space-y-2">
                  <FilterComponent />
                  <Button
                    className="w-full text-xl h-12 font-semibold"
                    variant={'outline'}
                    onClick={() => {
                      clearFilters();
                    }}
                  >
                    모두 지우기
                  </Button>
                  <Button
                    className="w-full text-xl h-12 font-semibold"
                    variant={'default'}
                    onClick={() => setIsFilterOpen(false)}
                  >
                    닫기
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 bg-slate-100 opacity-100 w-full px-5 py-4 overflow-y-scroll overscroll-none h-[480px]">
          {isPending ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              {activeTab === 'VIDEO' && <Video courseData={filteredVods} />}
              {activeTab === 'ASSIGN' && <Assignment courseData={filteredAssigns} />}
              {activeTab === 'QUIZ' && <QuizTab courseData={filteredQuizes} />}
            </>
          )}
        </div>
        <PopoverFooter activeTab={activeTab} setActiveTab={setActiveTab} />
      </PopoverContent>
    </Popover>
  );
}
