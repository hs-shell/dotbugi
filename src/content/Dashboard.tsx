import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useState } from 'react';
import icon from '@/assets/icon.png';
import exit from '@/assets/exit.png';
import { CourseBase, TAB_TYPE } from './types';
import { OctagonAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useGetCourses } from '@/hooks/useGetCourses';
import VodList from './components/VodList';
import AssignList from './components/AssignList';
import QuizList from './components/QuizList';
import PendingDialog from './components/PendingDialog';
import { useCourseData } from '@/hooks/useCourseData';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import TabNavigation from './components/TabNavigation';
import StickyPopoverTrigger from './components/StickyPopoverTrigger';
import DashboardHeader from './components/DashboardHeader';

export default function Dashboard() {
  const { courses } = useGetCourses();
  const typeCourses: CourseBase[] = courses;

  const { vods, assigns, quizzes, isPending, remainingTime, isError, updateData, setIsPending } =
    useCourseData(typeCourses);

  const [activeTab, setActiveTab] = useState<TAB_TYPE>(TAB_TYPE.VIDEO);
  const [isOpen, setIsOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    filters,
    courseTitlesMap,
    filteredVods,
    filteredAssigns,
    filteredQuizzes,
    handleCourseTitleChange,
    handleAttendanceFilterChange,
    handleSubmitFilterChange,
    clearFilters,
  } = useDashboardFilters({ vods, assigns, quizzes, activeTab });

  const handleToggleOpen = (e: React.MouseEvent) => {
    setIsOpen((prev) => !prev);
    e.preventDefault();
  };

  const handleRefresh = () => {
    if (isPending || remainingTime <= 1) return;
    setIsPending(true);
    updateData();
  };

  return (
    <>
      <PendingDialog isPending={isPending} onClose={() => {}} />
      <Popover open={isOpen}>
        <StickyPopoverTrigger>
          <PopoverTrigger asChild className="transition-all duration-1000 justify-self-end">
            <img
              src={isOpen ? exit : icon}
              onClick={handleToggleOpen}
              draggable={false}
              className="rounded-2xl w-32 h-32 shadow-2xl shadow-zinc-900 cursor-pointer"
              alt={isOpen ? 'Close' : 'Open'}
            />
          </PopoverTrigger>
        </StickyPopoverTrigger>
        <PopoverContent
          className="bg-white opacity-100 rounded-3xl border-none shadow-2xl shadow-zinc-600 px-0 py-0 flex flex-col items-center justify-center w-[350px] h-[550px] translate-x-[-8px]"
          side="top"
          sideOffset={8}
        >
          <DashboardHeader
            activeTab={activeTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            isFilterOpen={isFilterOpen}
            onFilterToggle={() => setIsFilterOpen((prev) => !prev)}
            courseTitlesMap={courseTitlesMap}
            onCourseTitleChange={handleCourseTitleChange}
            onAttendanceFilterChange={handleAttendanceFilterChange}
            onSubmitFilterChange={handleSubmitFilterChange}
            onClearFilters={clearFilters}
            remainingTime={remainingTime}
            isPending={isPending}
            onRefresh={handleRefresh}
          />
          <div className="grid grid-cols-1 bg-slate-100 opacity-100 w-full px-5 py-4 overflow-y-scroll overscroll-none h-[480px]">
            {isPending ? (
              <div className="flex justify-center items-center h-full">
                <Spinner className="h-8 w-8" />
              </div>
            ) : isError ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <OctagonAlert className="w-12 h-12 text-red-800" />
                <p className="py-4 text-2xl font-semibold text-red-800">오류가 발생했습니다.</p>
                <p
                  onClick={() => location.reload()}
                  className="py-4 text-xl font-medium underline text-zinc-500 hover:text-zinc-950 hover:cursor-pointer transition-all duration-200"
                >
                  페이지 새로고침
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'VIDEO' && <VodList courseData={filteredVods} />}
                {activeTab === 'ASSIGN' && <AssignList courseData={filteredAssigns} />}
                {activeTab === 'QUIZ' && <QuizList courseData={filteredQuizzes} />}
              </>
            )}
          </div>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </PopoverContent>
      </Popover>
    </>
  );
}
