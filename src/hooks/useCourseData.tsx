import { useState, useEffect, useCallback } from 'react';
import { Vod, Assign, Quiz, CourseBase } from '@/content/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { requestData } from '@/lib/fetchCourseData';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';
import { makeItemKey, makeVodKey } from '@/utils/generate-key';

async function loadMockData() {
  const { mockVods, mockAssigns, mockQuizes } = await import('@/mocks/mockData');
  return { vods: mockVods, assigns: mockAssigns, quizzes: mockQuizes };
}

function mergeVodData(
  course: CourseBase,
  vodDataArray: { week: number; subject: string; title: string; url: string; range: string | null; length: string }[],
  vodAttendanceArray: { title: string; isAttendance: string; weeklyAttendance: string; week: number }[]
): Vod[] {
  const attendanceMap = new Map<string, (typeof vodAttendanceArray)[number]>();
  for (const att of vodAttendanceArray) {
    attendanceMap.set(`${att.title}-${att.week}`, att);
  }

  const results: Vod[] = [];
  for (const vod of vodDataArray) {
    if (!isCurrentDateInRange(vod.range)) continue;
    const att = attendanceMap.get(`${vod.title}-${vod.week}`);
    if (!att) continue;
    results.push({
      ...course,
      ...vod,
      isAttendance: att.isAttendance,
      weeklyAttendance: att.weeklyAttendance,
    });
  }
  return results;
}

function collectDueDateItems<T extends { title: string; dueDate: string | null }>(
  course: CourseBase,
  items: T[],
): (CourseBase & T)[] {
  return items
    .filter((item) => isCurrentDateByDate(item.dueDate))
    .map((item) => ({ ...course, ...item }));
}

export function useCourseData(courses: CourseBase[]) {
  const [vods, setVods] = useState<Vod[]>([]);
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [refreshTime, setRefreshTime] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!import.meta.env.VITE_MOCK) return;
    let cancelled = false;
    loadMockData().then(({ vods, assigns, quizzes }) => {
      if (cancelled) return;
      setVods(vods);
      setAssigns(assigns);
      setQuizzes(quizzes);
      setRefreshTime(new Date().toLocaleTimeString());
      setRemainingTime(5);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateData = useCallback(async () => {
    if (import.meta.env.VITE_MOCK) {
      const mock = await loadMockData();
      setVods(mock.vods);
      setAssigns(mock.assigns);
      setQuizzes(mock.quizzes);
      setRefreshTime(new Date().toLocaleTimeString());
      setRemainingTime(0);
      return;
    }

    try {
      setIsError(false);
      setIsPending(true);
      const currentTime = Date.now();

      const vodSet = new Set<string>();
      const assignSet = new Set<string>();
      const quizSet = new Set<string>();

      const allVods: Vod[] = [];
      const allAssigns: Assign[] = [];
      const allQuizzes: Quiz[] = [];

      await Promise.all(
        courses.map(async (course) => {
          const result = await requestData(course.courseId);

          for (const vod of mergeVodData(course, result.vodDataArray, result.vodAttendanceArray)) {
            const key = makeVodKey(vod.courseId, vod.title, vod.week);
            if (!vodSet.has(key)) {
              vodSet.add(key);
              allVods.push(vod);
            }
          }

          for (const assign of collectDueDateItems(course, result.assignDataArray)) {
            const key = makeItemKey(assign.courseId, assign.title, assign.dueDate ?? '');
            if (!assignSet.has(key)) {
              assignSet.add(key);
              allAssigns.push(assign);
            }
          }

          for (const quiz of collectDueDateItems(course, result.quizDataArray)) {
            const key = makeItemKey(quiz.courseId, quiz.title, quiz.dueDate ?? '');
            if (!quizSet.has(key)) {
              quizSet.add(key);
              allQuizzes.push(quiz);
            }
          }
        })
      );

      setVods(allVods);
      setAssigns(allAssigns);
      setQuizzes(allQuizzes);

      saveDataToStorage('vod', allVods);
      saveDataToStorage('assign', allAssigns);
      saveDataToStorage('quiz', allQuizzes);

      setRefreshTime(new Date(currentTime).toLocaleTimeString());
      setRemainingTime(0);
      localStorage.setItem('lastRequestTime', currentTime.toString());
      saveDataToStorage('lastRequestTime', currentTime.toString());
    } catch (error) {
      console.warn(error);
      localStorage.removeItem('lastRequestTime');
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  }, [courses]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (remainingTime >= 1440) {
      updateData();
    } else {
      timer = setTimeout(() => {
        setRemainingTime((prev) => prev + 1);
      }, 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [remainingTime, updateData]);

  useEffect(() => {
    if (!courses || courses.length === 0) return;

    const lastRequestTime = localStorage.getItem('lastRequestTime');
    const currentTime = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastRequestTime) {
      setRefreshTime(new Date(parseInt(lastRequestTime, 10)).toLocaleTimeString());
    }

    if (!lastRequestTime || currentTime - parseInt(lastRequestTime, 10) >= oneDay) {
      setIsPending(true);
      updateData();
    } else {
      const minutes = (currentTime - parseInt(lastRequestTime, 10)) / (60 * 1000);
      setRemainingTime(minutes);
      loadDataFromStorage('vod', (data) => {
        if (!data) return;
        setVods((data as Vod[]).filter((vod) => isCurrentDateInRange(vod.range)));
      });
      loadDataFromStorage('assign', (data) => {
        if (!data) return;
        setAssigns((data as Assign[]).filter((assign) => isCurrentDateByDate(assign.dueDate)));
      });
      loadDataFromStorage('quiz', (data) => {
        if (!data) return;
        setQuizzes((data as Quiz[]).filter((quiz) => isCurrentDateByDate(quiz.dueDate)));
      });
    }
  }, [courses, updateData]);

  return { vods, assigns, quizzes, isPending, remainingTime, refreshTime, isError, updateData, setIsPending };
}
