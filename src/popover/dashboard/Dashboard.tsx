import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import icon from '@/assets/icon.png';
import exit from '@/assets/exit.png';
import { TAB_TYPE } from '@/types';
import { OctagonAlert } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useGetCourses } from '@/hooks/useGetCourses';
import VodList from './components/VodList';
import AssignList from './components/AssignList';
import QuizList from './components/QuizList';
import { useCourseData } from '@/hooks/useCourseData';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import TabNavigation from './components/TabNavigation';
import StickyPopoverTrigger from './components/StickyPopoverTrigger';
import DashboardHeader from './components/DashboardHeader';
import InfoBubble from './components/InfoBubble';
import NotificationBubble, { type Notification } from './components/NotificationBubble';
import { useTranslation } from 'react-i18next';
import { isAttended } from '@/lib/utils';
import { makeVodGroupKey } from '@/lib/generateKey';
import Setting from './components/Setting';
import { useHiddenTasks } from '@/hooks/useHiddenTasks';
import {
  getOAuthToken,
  removeCachedAuthToken,
  getCalendarEvents,
  addCalendarEventsBatch,
  convertCalendarEventsToGoogleEvents,
} from '@/lib/calendarUtils';
import { vodGroupsToEvents, dueDateItemToEvent } from '@/lib/transformCalendarEvents';

const BUBBLE_DISMISS_KEY = 'dotbugi_bubble_dismissed';
const BUBBLE_DISMISS_DURATION = import.meta.env.VITE_MOCK ? 1000 * 30 : 1000 * 60 * 60; // mock: 30초, prod: 1시간

function isBubbleDismissed(): boolean {
  const raw = localStorage.getItem(BUBBLE_DISMISS_KEY);
  if (!raw) return false;
  return Date.now() - parseInt(raw, 10) < BUBBLE_DISMISS_DURATION;
}

let notifIdCounter = 0;

export default function Dashboard() {
  const { t } = useTranslation('common');
  const { allCourses, trackedCourses, trackedCourseIds } = useGetCourses();

  const {
    vods,
    assigns,
    quizzes,
    isPending,
    remainingTime,
    isError,
    refreshCourseData,
    addCourseData,
    removeCourseData,
  } = useCourseData(trackedCourses);

  const { hiddenUrls, hideTask, hideTasks, unhideTask, isHidden } = useHiddenTasks();

  // 숨긴 태스크 필터링
  const visibleVods = useMemo(() => vods.filter((v) => !isHidden(v.url)), [vods, isHidden]);
  const visibleAssigns = useMemo(() => assigns.filter((a) => !isHidden(a.url)), [assigns, isHidden]);
  const visibleQuizzes = useMemo(() => quizzes.filter((q) => !isHidden(q.url)), [quizzes, isHidden]);

  // 설정에서 숨긴 태스크 목록 표시용
  const hiddenTaskInfos = useMemo(() => {
    const all = [
      ...vods.map((v) => ({ url: v.url, title: v.title, courseTitle: v.courseTitle })),
      ...assigns.map((a) => ({ url: a.url, title: a.title, courseTitle: a.courseTitle })),
      ...quizzes.map((q) => ({ url: q.url, title: q.title, courseTitle: q.courseTitle })),
    ];
    return all.filter((item) => hiddenUrls.has(item.url));
  }, [vods, assigns, quizzes, hiddenUrls]);

  const [activeTab, setActiveTab] = useState<TAB_TYPE>(TAB_TYPE.VIDEO);
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(isBubbleDismissed);
  const [bubbleHiddenByOpen, setBubbleHiddenByOpen] = useState(false);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifHiddenByOpen, setNotifHiddenByOpen] = useState(false);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenExpiredNotifRef = useRef<string | null>(null);

  const isCalendarConnected = calendarToken !== null;

  // DOM 토글에서 trackedCourseIds 변경 시 데이터 추가/삭제
  const prevTrackedIdsRef = useRef<Set<string>>(new Set(trackedCourseIds));
  useEffect(() => {
    const prevSet = prevTrackedIdsRef.current;
    const currSet = new Set(trackedCourseIds);
    prevTrackedIdsRef.current = currSet;

    if (prevSet.size === 0) return;

    const allCourseIds = new Set(allCourses.map((c) => c.courseId));

    for (const id of trackedCourseIds) {
      if (!prevSet.has(id) && allCourseIds.has(id)) {
        const course = allCourses.find((c) => c.courseId === id);
        if (course) addCourseData(course);
      }
    }

    for (const id of prevSet) {
      if (!currSet.has(id)) {
        removeCourseData(id);
      }
    }
  }, [trackedCourseIds, allCourses, addCourseData, removeCourseData]);

  const pushNotification = useCallback((n: Omit<Notification, 'id'>) => {
    const id = `notif-${++notifIdCounter}`;
    setNotifications((prev) => [...prev, { ...n, id }]);
    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Omit<Notification, 'id'>>) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  // 새로고침 시작/완료 시 NotificationBubble 표시
  const refreshNotifRef = useRef<string | null>(null);
  const prevIsPendingRef = useRef(false);
  useEffect(() => {
    if (isPending && !prevIsPendingRef.current) {
      if (refreshNotifRef.current) dismissNotification(refreshNotifRef.current);
      refreshNotifRef.current = pushNotification({ type: 'loading', messageKey: 'refreshing' });
    } else if (!isPending && prevIsPendingRef.current && refreshNotifRef.current) {
      updateNotification(refreshNotifRef.current, {
        type: 'success',
        messageKey: 'refreshSuccess',
        autoDismiss: true,
      });
      refreshNotifRef.current = null;
    }
    prevIsPendingRef.current = isPending;
  }, [isPending, pushNotification, dismissNotification, updateNotification]);

  const showTokenExpiredNotif = useCallback(() => {
    if (tokenExpiredNotifRef.current) return;
    const id = pushNotification({
      type: 'warning',
      messageKey: 'calendar.tokenExpired',
      action: {
        labelKey: 'calendar.tokenExpiredAction',
        onClick: async () => {
          const token = await getOAuthToken(true);
          if (token) setCalendarToken(token);
        },
      },
    });
    tokenExpiredNotifRef.current = id;
  }, [pushNotification]);

  const clearTokenExpiredNotif = useCallback(() => {
    if (tokenExpiredNotifRef.current) {
      dismissNotification(tokenExpiredNotifRef.current);
      tokenExpiredNotifRef.current = null;
    }
  }, [dismissNotification]);

  const handleTokenExpired = useCallback(async () => {
    if (calendarToken) {
      await removeCachedAuthToken(calendarToken);
    }
    setCalendarToken(null);
    showTokenExpiredNotif();
  }, [calendarToken, showTokenExpiredNotif]);

  // 로그인 성공 시 만료 알림 제거
  useEffect(() => {
    if (calendarToken) {
      clearTokenExpiredNotif();
    }
  }, [calendarToken, clearTokenExpiredNotif]);

  useEffect(() => {
    if (import.meta.env.VITE_MOCK) {
      removeCachedAuthToken('').catch(() => {});
      setCalendarToken(null);
      showTokenExpiredNotif();
    } else {
      getOAuthToken(false).then((token) => {
        if (token) setCalendarToken(token);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalendarLogin = async () => {
    const token = await getOAuthToken(true);
    if (token) {
      setCalendarToken(token);
    }
  };

  const handleCalendarLogout = async () => {
    if (calendarToken) {
      try {
        await removeCachedAuthToken(calendarToken);
      } catch (e) {
        console.warn('[Dotbugi] removeCachedAuthToken failed:', e);
      }
    }
    setCalendarToken(null);
  };

  const handleCalendarSync = async () => {
    const token = calendarToken ?? (await getOAuthToken(true));
    if (!token) return;

    const syncId = pushNotification({ type: 'loading', messageKey: 'calendar.syncing' });

    const calendarEvents = [
      ...vodGroupsToEvents(visibleVods),
      ...visibleAssigns.map((a) => dueDateItemToEvent(a, 'assign')),
      ...visibleQuizzes.map((q) => dueDateItemToEvent(q, 'quiz')),
    ];

    const { events: existingEvents, tokenExpired: fetchExpired } = await getCalendarEvents(token);
    if (fetchExpired) {
      dismissNotification(syncId);
      await handleTokenExpired();
      return;
    }

    const newEventsData = convertCalendarEventsToGoogleEvents(calendarEvents);

    const eventKey = (event: {
      summary?: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
    }) =>
      `${(event.summary || '').trim().toLowerCase()}|${new Date(event.start.dateTime || event.start.date || '').getTime()}|${new Date(event.end.dateTime || event.end.date || '').getTime()}`;

    const existingKeys = new Set(existingEvents.map(eventKey));
    const uniqueNewEvents = newEventsData.filter((e) => !existingKeys.has(eventKey(e)));

    if (uniqueNewEvents.length === 0) {
      updateNotification(syncId, { type: 'success', messageKey: 'calendar.syncNoNew', autoDismiss: true });
      return;
    }

    const result = await addCalendarEventsBatch(uniqueNewEvents, token);

    if (result.tokenExpired) {
      dismissNotification(syncId);
      await handleTokenExpired();
      return;
    }

    if (result.failed === 0) {
      updateNotification(syncId, {
        type: 'success',
        messageKey: 'calendar.syncSuccess',
        messageParams: { count: result.added },
        autoDismiss: true,
      });
    } else if (result.added === 0) {
      updateNotification(syncId, {
        type: 'error',
        messageKey: 'calendar.syncFailed',
        messageParams: { failed: result.failed },
        autoDismiss: true,
      });
    } else {
      updateNotification(syncId, {
        type: 'warning',
        messageKey: 'calendar.syncPartial',
        messageParams: { added: result.added, failed: result.failed },
        autoDismiss: true,
      });
    }
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
  } = useDashboardFilters({ vods: visibleVods, assigns: visibleAssigns, quizzes: visibleQuizzes, activeTab });

  const taskCount = useMemo(() => {
    const unattendedGroups = new Set<string>();
    for (const v of visibleVods) {
      if (!isAttended(v.weeklyAttendance)) {
        unattendedGroups.add(makeVodGroupKey(v.courseId, v.subject, v.range));
      }
    }
    const unsubmittedAssigns = visibleAssigns.filter((a) => !a.isSubmit).length;
    const unsubmittedQuizzes = visibleQuizzes.filter((q) => !q.isSubmit).length;
    return unattendedGroups.size + unsubmittedAssigns + unsubmittedQuizzes;
  }, [visibleVods, visibleAssigns, visibleQuizzes]);

  const hasIncomplete = useMemo(
    () => ({
      [TAB_TYPE.VIDEO]: visibleVods.some((v) => !isAttended(v.weeklyAttendance)),
      [TAB_TYPE.ASSIGN]: visibleAssigns.some((a) => !a.isSubmit),
      [TAB_TYPE.QUIZ]: visibleQuizzes.some((q) => !q.isSubmit),
    }),
    [visibleVods, visibleAssigns, visibleQuizzes]
  );

  const handleToggleOpen = (e: React.MouseEvent) => {
    setIsOpen((prev) => {
      if (!prev) {
        setBubbleHiddenByOpen(true);
        setNotifHiddenByOpen(true);
        if (bubbleTimerRef.current) {
          clearTimeout(bubbleTimerRef.current);
          bubbleTimerRef.current = null;
        }
        if (notifTimerRef.current) {
          clearTimeout(notifTimerRef.current);
          notifTimerRef.current = null;
        }
      } else {
        bubbleTimerRef.current = setTimeout(() => {
          setBubbleHiddenByOpen(false);
          bubbleTimerRef.current = null;
        }, 500);
        notifTimerRef.current = setTimeout(() => {
          setNotifHiddenByOpen(false);
          notifTimerRef.current = null;
        }, 500);
      }
      return !prev;
    });
    e.preventDefault();
  };

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (isPending) return;
    refreshCourseData();
  };

  const handleDismissBubble = () => {
    setBubbleDismissed(true);
    localStorage.setItem(BUBBLE_DISMISS_KEY, Date.now().toString());
  };

  const showBubble = !isOpen && !bubbleDismissed && !bubbleHiddenByOpen && !isPending;

  const filterHandlers = {
    searchTerm,
    onSearchChange: setSearchTerm,
    filters,
    isFilterOpen,
    onFilterToggle: () => setIsFilterOpen((prev: boolean) => !prev),
    courseTitlesMap,
    onCourseTitleChange: handleCourseTitleChange,
    onAttendanceFilterChange: handleAttendanceFilterChange,
    onSubmitFilterChange: handleSubmitFilterChange,
    onClearFilters: clearFilters,
  };

  const headerActions = {
    remainingTime,
    isPending,
    onRefresh: handleRefresh,
    onOpenSetting: () => setActiveTab(TAB_TYPE.SETTING),
    isCalendarConnected,
    onCalendarSync: handleCalendarSync,
  };

  return (
    <>
      <Popover open={isOpen}>
        <StickyPopoverTrigger>
          {!isOpen && (
            <div className="absolute bottom-full right-0 mb-2 flex flex-col items-end gap-2">
              {!notifHiddenByOpen && notifications.length > 0 && (
                <NotificationBubble notifications={notifications} onDismiss={dismissNotification} />
              )}
              {showBubble && (
                <InfoBubble taskCount={taskCount} remainingTime={remainingTime} onDismiss={handleDismissBubble} />
              )}
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
          {isOpen && notifications.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-2">
              <NotificationBubble notifications={notifications} onDismiss={dismissNotification} />
            </div>
          )}
          <DashboardHeader activeTab={activeTab} filter={filterHandlers} actions={headerActions} />
          <div className="grid grid-cols-1 bg-slate-100 opacity-100 w-full pl-4 pr-0 py-4 overflow-y-scroll overscroll-none h-[480px]">
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
                {activeTab === 'VIDEO' && <VodList courseData={filteredVods} onHideTask={hideTask} onHideTasks={hideTasks} />}
                {activeTab === 'ASSIGN' && <AssignList courseData={filteredAssigns} onHideTask={hideTask} />}
                {activeTab === 'QUIZ' && <QuizList courseData={filteredQuizzes} onHideTask={hideTask} />}
                {activeTab === 'SETTING' && (
                  <Setting
                    isCalendarConnected={isCalendarConnected}
                    onCalendarLogin={handleCalendarLogin}
                    onCalendarLogout={handleCalendarLogout}
                    hiddenTasks={hiddenTaskInfos}
                    onUnhideTask={unhideTask}
                  />
                )}
              </>
            )}
          </div>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} hasIncomplete={hasIncomplete} />
        </PopoverContent>
      </Popover>
    </>
  );
}
