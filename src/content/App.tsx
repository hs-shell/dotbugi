import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useEffect, useMemo, useState } from 'react';
import icon from '@/assets/icon.png';
import exit from '@/assets/exit.png';
import { Assign, Filters, Quiz, TAB_TYPE, Vod } from './types';
import { ListFilter, RefreshCw, Search } from 'lucide-react';
import filter from '@/assets/filter.svg';
import PopoverFooter from './components/PopoverFooter';
import { Spinner } from '@/components/ui/spinner';
import { useGetCourses } from '@/hooks/useGetCourse';
import Video from './components/Video';
import Assignment from './components/Assignment';
import QuizTab from './components/QuizTab';
import { Button } from '@/components/ui/button';
import FilterBadge from './components/FilterBadge';

import FilterPanel from './components/FilterPanel';
import { useCourseData } from '@/hooks/useCourseData';
import { filterVods, filterAssigns, filterQuizes } from '@/lib/filterData';
import PendingDialogWithBeforeUnload from './components/PendingDialog';
import StickyPopoverTrigger from './StickyPopoverTrigger';

// 리팩토링: 필터 옵션 추출
const attendanceOptions = ['출석', '결석']; // string[]
const submitOptions = [
  { label: '제출완료', value: true },
  { label: '제출필요', value: false },
]; // { label: string, value: boolean }[]

export default function App() {
  const { courses } = useGetCourses();

  // 데이터 관련 상태를 useCourseData 커스텀 훅으로 관리
  const { vods, assigns, quizes, isPending, remainingTime, refreshTime, updateData, setIsPending } =
    useCourseData(courses);

  // activeTab의 타입을 TAB_TYPE으로 지정
  const [activeTab, setActiveTab] = useState<TAB_TYPE>(TAB_TYPE.VIDEO);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vodSortBy, setVodSortBy] = useState<keyof Vod>('isAttendance');
  const [assignSortBy, setAssignSortBy] = useState<keyof Assign>('isSubmit');
  const [quizSortBy, setQuizSortBy] = useState<keyof Quiz>('dueDate');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태 관리 - Record을 사용하여 TAB_TYPE을 키로 지정
  const [filters, setFilters] = useState<Record<TAB_TYPE, Filters>>({
    VIDEO: { courseTitles: [], attendanceStatuses: [] },
    ASSIGN: { courseTitles: [], submitStatuses: [] },
    QUIZ: { courseTitles: [] },
  });

  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  useEffect(() => {
    setSearchTerm('');
    setIsFilterOpen(false);
  }, [activeTab]);

  // 필터 옵션 추출
  const courseTitlesMap = useMemo(
    () => ({
      VIDEO: Array.from(new Set(vods.map((vod) => vod.courseTitle))),
      ASSIGN: Array.from(new Set(assigns.map((assign) => assign.courseTitle))),
      QUIZ: Array.from(new Set(quizes.map((quiz) => quiz.courseTitle))),
    }),
    [vods, assigns, quizes]
  );

  // 필터 적용
  const filteredVods = useMemo(() => {
    return filterVods(vods, filters[activeTab], searchTerm, vodSortBy);
  }, [vods, filters, activeTab, searchTerm, vodSortBy]);

  const filteredAssigns = useMemo(() => {
    return filterAssigns(assigns, filters[activeTab], searchTerm, assignSortBy);
  }, [assigns, filters, activeTab, searchTerm, assignSortBy]);

  const filteredQuizes = useMemo(() => {
    return filterQuizes(quizes, filters[activeTab], searchTerm, quizSortBy);
  }, [quizes, filters, activeTab, searchTerm, quizSortBy]);

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <PendingDialogWithBeforeUnload isPending={isPending} onClose={() => {}} />
      <Popover open={isOpen}>
        <StickyPopoverTrigger>
          <PopoverTrigger asChild className="transition-all duration-1000 justify-self-end">
            {isOpen ? (
              <img
                src={exit}
                onClick={(e) => {
                  setIsOpen(!isOpen);
                  e.preventDefault();
                }}
                draggable={false}
                className="rounded-2xl w-32 h-32 shadow-2xl shadow-zinc-900 cursor-pointer"
                alt="Close"
              />
            ) : (
              <img
                src={icon}
                onClick={(e) => {
                  setIsOpen(!isOpen);
                  e.preventDefault();
                }}
                draggable={false}
                className="rounded-2xl w-32 h-32 shadow-2xl shadow-zinc-900 cursor-pointer"
                alt="Open"
              />
            )}
          </PopoverTrigger>
        </StickyPopoverTrigger>
        <PopoverContent
          className="bg-white opacity-100 rounded-3xl border-none shadow-2xl shadow-zinc-600 px-0 py-0 flex flex-col items-center justify-center w-[350px] h-[550px] translate-x-[-8px]"
          side="top"
          sideOffset={8}
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
                {/* refreshTime 대신 남은 시간을 표시 */}
                <span
                  className={`text-sm px-1 ${
                    // 필요에 따라 색상 조건은 수정 가능 (예시로 30분 기준)
                    remainingTime < 60
                      ? Math.round(remainingTime) >= 30
                        ? 'text-amber-500 font-semibold'
                        : 'text-zinc-400'
                      : Math.floor(remainingTime / 60) >= 1
                        ? 'text-amber-500 font-semibold'
                        : 'text-zinc-400'
                  }`}
                >
                  {remainingTime < 60
                    ? `${Math.round(remainingTime)}분 전`
                    : `${Math.floor(remainingTime / 60)}시간 전`}
                </span>
                <button
                  className={`flex rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 p-2 ml-1 ${(isPending || remainingTime <= 5) && 'cursor-not-allowed'}`}
                  disabled={isPending || remainingTime <= 5}
                  onClick={() => {
                    if (isPending || remainingTime <= 5) return;
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
                    <FilterPanel
                      filters={filters}
                      activeTab={activeTab}
                      courseTitlesMap={courseTitlesMap}
                      handleCourseTitleChange={handleCourseTitleChange}
                      handleAttendanceFilterChange={handleAttendanceFilterChange}
                      handleSubmitFilterChange={handleSubmitFilterChange}
                      attendanceOptions={attendanceOptions}
                      submitOptions={submitOptions}
                    />
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
    </>
  );
}
