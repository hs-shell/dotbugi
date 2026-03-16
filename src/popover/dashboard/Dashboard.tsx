import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useMemo, useState } from 'react';
import icon from '@/assets/icon.png';
import exit from '@/assets/exit.png';
import { TAB_TYPE } from '@/types';
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
import InfoBubble from './components/InfoBubble';
import { useTranslation } from 'react-i18next';
import { isAttended } from '@/lib/utils';
import Setting from './components/Setting';

const BUBBLE_DISMISS_KEY = 'dotbugi_bubble_dismissed';
const BUBBLE_DISMISS_DURATION = import.meta.env.VITE_MOCK ? 1000 * 30 : 1000 * 60 * 60; // mock: 30초, prod: 1시간

function isBubbleDismissed(): boolean {
  const raw = localStorage.getItem(BUBBLE_DISMISS_KEY);
  if (!raw) return false;
  return Date.now() - parseInt(raw, 10) < BUBBLE_DISMISS_DURATION;
}

export default function Dashboard() {
  const { t } = useTranslation('common');
  const { courses } = useGetCourses();

  const { vods, assigns, quizzes, isPending, remainingTime, isError, refreshCourseData, setIsPending } =
    useCourseData(courses);

  const [activeTab, setActiveTab] = useState<TAB_TYPE>(TAB_TYPE.VIDEO);
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(isBubbleDismissed);
  const [bubbleHiddenByOpen, setBubbleHiddenByOpen] = useState(false);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);

  const isCalendarConnected = calendarToken !== null;
  const handleCalendarLogin = () => setCalendarToken('mock');
  const handleCalendarLogout = () => setCalendarToken(null);
  const handleCalendarSync = () => {
    // TODO: calendar sync logic
  };

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

  const taskCount = useMemo(() => {
    const unattendedVods = vods.filter((v) => !isAttended(v.weeklyAttendance)).length;
    const unsubmittedAssigns = assigns.filter((a) => !a.isSubmit).length;
    return unattendedVods + unsubmittedAssigns + quizzes.length;
  }, [vods, assigns, quizzes]);

  const handleToggleOpen = (e: React.MouseEvent) => {
    setIsOpen((prev) => {
      if (!prev) setBubbleHiddenByOpen(true);
      return !prev;
    });
    e.preventDefault();
  };

  const handleRefresh = () => {
    if (isPending || remainingTime <= 1) return;
    setIsPending(true);
    refreshCourseData();
  };

  const handleDismissBubble = () => {
    setBubbleDismissed(true);
    localStorage.setItem(BUBBLE_DISMISS_KEY, Date.now().toString());
  };

  const showBubble = !isOpen && !bubbleDismissed && !bubbleHiddenByOpen && !isPending && taskCount > 0;

  return (
    <>
      <PendingDialog isPending={isPending} onClose={() => {}} />
      <Popover open={isOpen}>
        <StickyPopoverTrigger>
          {showBubble && (
            <div className="absolute bottom-full right-0 mb-2">
              <InfoBubble taskCount={taskCount} remainingTime={remainingTime} onDismiss={handleDismissBubble} />
            </div>
          )}
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
            onOpenSetting={() => setActiveTab(TAB_TYPE.SETTING)}
            isCalendarConnected={isCalendarConnected}
            onCalendarSync={handleCalendarSync}
          />
          <div className="grid grid-cols-1 bg-slate-100 opacity-100 w-full px-5 py-4 overflow-y-scroll overscroll-none h-[480px]">
            {isPending ? (
              <div className="flex justify-center items-center h-full">
                <Spinner className="h-8 w-8" />
              </div>
            ) : isError ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <OctagonAlert className="w-12 h-12 text-red-800" />
                <p className="py-4 text-2xl font-semibold text-red-800">{t('error.occurred')}</p>
                <p
                  onClick={() => location.reload()}
                  className="py-4 text-xl font-medium underline text-zinc-500 hover:text-zinc-950 hover:cursor-pointer transition-all duration-200"
                >
                  {t('error.refreshPage')}
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'VIDEO' && <VodList courseData={filteredVods} />}
                {activeTab === 'ASSIGN' && <AssignList courseData={filteredAssigns} />}
                {activeTab === 'QUIZ' && <QuizList courseData={filteredQuizzes} />}
                {activeTab === 'SETTING' && (
                  <Setting
                    isCalendarConnected={isCalendarConnected}
                    onCalendarLogin={handleCalendarLogin}
                    onCalendarLogout={handleCalendarLogout}
                  />
                )}
              </>
            )}
          </div>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </PopoverContent>
      </Popover>
    </>
  );
}
