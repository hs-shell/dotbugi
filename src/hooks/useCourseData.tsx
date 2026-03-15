import { useState, useEffect, useCallback } from 'react';
import { Vod, Assign, Quiz, CourseBase } from '@/content/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { requestData } from '@/lib/fetchCourseData';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';
import { makeItemKey, makeVodKey } from '@/utils/generate-key';
import { mergeVodWithAttendance, mergeDueDateItems, deduplicateInto } from '@/lib/transformCourseData';
import { loadMockData } from '@/mocks/loadMockData';
import {
  REFRESH_INTERVAL_MS,
  CACHE_TTL_MINUTES,
  CACHE_TTL_MS,
  getLastRequestTime,
  setLastRequestTime,
  clearLastRequestTime,
} from '@/lib/cache';

export function useCourseData(courses: CourseBase[]) {
  const [vods, setVods] = useState<Vod[]>([]);
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [refreshTime, setRefreshTime] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isError, setIsError] = useState(false);

  const applyMock = useCallback(async () => {
    const mock = await loadMockData();
    setVods(mock.vods);
    setAssigns(mock.assigns);
    setQuizzes(mock.quizzes);
  }, []);

  useEffect(() => {
    if (!import.meta.env.VITE_MOCK) return;
    let cancelled = false;
    applyMock().then(() => {
      if (cancelled) return;
      setRefreshTime(new Date().toLocaleTimeString());
      setRemainingTime(5);
    });
    return () => {
      cancelled = true;
    };
  }, [applyMock]);

  const refreshCourseData = useCallback(async () => {
    if (import.meta.env.VITE_MOCK) {
      await applyMock();
      setRefreshTime(new Date().toLocaleTimeString());
      setRemainingTime(0);
      return;
    }

    try {
      setIsError(false);
      setIsPending(true);
      const fetchedAt = Date.now();

      const vods: Vod[] = [];
      const assigns: Assign[] = [];
      const quizzes: Quiz[] = [];
      const seenVods = new Set<string>();
      const seenAssigns = new Set<string>();
      const seenQuizzes = new Set<string>();

      await Promise.all(
        courses.map(async (course) => {
          const scraped = await requestData(course.courseId);

          deduplicateInto(
            vods,
            mergeVodWithAttendance(course, scraped.vodDataArray, scraped.vodAttendanceArray),
            seenVods,
            (v) => makeVodKey(v.courseId, v.title, v.week),
          );
          deduplicateInto(
            assigns,
            mergeDueDateItems(course, scraped.assignDataArray),
            seenAssigns,
            (a) => makeItemKey(a.courseId, a.title, a.dueDate ?? ''),
          );
          deduplicateInto(
            quizzes,
            mergeDueDateItems(course, scraped.quizDataArray),
            seenQuizzes,
            (q) => makeItemKey(q.courseId, q.title, q.dueDate ?? ''),
          );
        })
      );

      setVods(vods);
      setAssigns(assigns);
      setQuizzes(quizzes);

      saveDataToStorage('vod', vods);
      saveDataToStorage('assign', assigns);
      saveDataToStorage('quiz', quizzes);

      setRefreshTime(new Date(fetchedAt).toLocaleTimeString());
      setRemainingTime(0);
      setLastRequestTime(fetchedAt);
      saveDataToStorage('lastRequestTime', fetchedAt.toString());
    } catch (error) {
      console.warn(error);
      clearLastRequestTime();
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  }, [courses, applyMock]);

  // 캐시 TTL 기반 자동 갱신 타이머
  useEffect(() => {
    if (remainingTime >= CACHE_TTL_MINUTES) {
      refreshCourseData();
      return;
    }
    const timer = setTimeout(() => setRemainingTime((prev) => prev + 1), REFRESH_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [remainingTime, refreshCourseData]);

  // 초기 로드: 캐시 확인 후 fetch 또는 캐시 사용
  useEffect(() => {
    if (!courses || courses.length === 0) return;

    const lastRequest = getLastRequestTime();
    const now = Date.now();

    if (lastRequest) {
      setRefreshTime(new Date(lastRequest).toLocaleTimeString());
    }

    if (!lastRequest || now - lastRequest >= CACHE_TTL_MS) {
      setIsPending(true);
      refreshCourseData();
    } else {
      setRemainingTime((now - lastRequest) / REFRESH_INTERVAL_MS);
      loadDataFromStorage('vod', (data) => {
        if (data) setVods((data as Vod[]).filter((vod) => isCurrentDateInRange(vod.range)));
      });
      loadDataFromStorage('assign', (data) => {
        if (data) setAssigns((data as Assign[]).filter((assign) => isCurrentDateByDate(assign.dueDate)));
      });
      loadDataFromStorage('quiz', (data) => {
        if (data) setQuizzes((data as Quiz[]).filter((quiz) => isCurrentDateByDate(quiz.dueDate)));
      });
    }
  }, [courses, refreshCourseData]);

  return {
    vods,
    assigns,
    quizzes,
    isPending,
    remainingTime,
    refreshTime,
    isError,
    refreshCourseData,
    setIsPending,
  };
}
