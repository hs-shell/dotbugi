import { useState, useEffect, useCallback, useRef } from 'react';
import { Vod, Assign, Quiz, CourseBase } from '@/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { scrapeCourseData } from '@/lib/fetchCourseData';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';
import { makeItemKey, makeVodKey } from '@/lib/generateKey';
import { mergeVodWithAttendance, mergeDueDateItems } from '@/lib/transformCourseData';
import { deduplicateInto } from '@/lib/deduplicateInto';
import { loadMockData } from '@/mocks/loadMockData';
import {
  REFRESH_INTERVAL_MS,
  CACHE_TTL_MINUTES,
  CACHE_TTL_MS,
  getLastRequestTime,
  setLastRequestTime,
  clearLastRequestTime,
} from '@/lib/cache';

const skipDateFilter = !!import.meta.env.VITE_MOCK_SKIP_DATE_FILTER;

function filterVodsForDisplay(vods: Vod[]): Vod[] {
  return skipDateFilter ? vods : vods.filter((v) => isCurrentDateInRange(v.range));
}

function filterItemsForDisplay<T extends { dueDate: string | null }>(items: T[]): T[] {
  return skipDateFilter ? items : items.filter((item) => item.dueDate === null || isCurrentDateByDate(item.dueDate));
}

export function useCourseData(courses: CourseBase[]) {
  const [vods, setVods] = useState<Vod[]>([]);
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const quizzesRef = useRef(quizzes);
  quizzesRef.current = quizzes;
  const [refreshTime, setRefreshTime] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isError, setIsError] = useState(false);
  const [pendingCourseIds, setPendingCourseIds] = useState<Set<string>>(new Set());

  const useMockData = import.meta.env.VITE_MOCK && !import.meta.env.VITE_MOCK_COURSES;

  const applyMock = useCallback(async () => {
    const mock = await loadMockData();
    setVods(mock.vods);
    setAssigns(mock.assigns);
    setQuizzes(mock.quizzes);
  }, []);

  useEffect(() => {
    if (!useMockData) return;
    let cancelled = false;
    applyMock().then(() => {
      if (cancelled) return;
      setRefreshTime(new Date().toLocaleTimeString());
      setRemainingTime(5);
    });
    return () => {
      cancelled = true;
    };
  }, [applyMock, useMockData]);

  const refreshCourseData = useCallback(async () => {
    if (useMockData) {
      await applyMock();
      setRefreshTime(new Date().toLocaleTimeString());
      setRemainingTime(0);
      setIsPending(false);
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

      // 현재 상태의 퀴즈 데이터를 courseId별로 그룹핑 (마감된 퀴즈 캐시용)
      const cachedQuizMap = new Map<string, Quiz[]>();
      for (const q of quizzesRef.current) {
        const arr = cachedQuizMap.get(q.courseId) ?? [];
        arr.push(q);
        cachedQuizMap.set(q.courseId, arr);
      }

      await Promise.all(
        courses.map(async (course) => {
          const scraped = await scrapeCourseData(course.courseId, cachedQuizMap.get(course.courseId), course.isCommunity);

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

      // Storage: 전체 데이터 저장 (강의 페이지 등에서 사용)
      saveDataToStorage('vod', vods);
      saveDataToStorage('assign', assigns);
      saveDataToStorage('quiz', quizzes);

      // State: 대시보드 표시용 날짜 필터링 적용
      setVods(filterVodsForDisplay(vods));
      setAssigns(filterItemsForDisplay(assigns));
      setQuizzes(filterItemsForDisplay(quizzes));

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
  }, [courses, applyMock, useMockData]);

  const addCourseData = useCallback(async (course: CourseBase) => {
    setPendingCourseIds((prev) => new Set(prev).add(course.courseId));
    try {
      const scraped = await scrapeCourseData(course.courseId, undefined, course.isCommunity);

      const newVods = mergeVodWithAttendance(course, scraped.vodDataArray, scraped.vodAttendanceArray);
      const newAssigns = mergeDueDateItems(course, scraped.assignDataArray);
      const newQuizzes = mergeDueDateItems(course, scraped.quizDataArray);

      // Storage: 전체 데이터 저장
      loadDataFromStorage<Vod[]>('vod', (stored) => {
        const all = [...(stored ?? [])];
        const seen = new Set(all.map((v) => makeVodKey(v.courseId, v.title, v.week)));
        deduplicateInto(all, newVods, seen, (v) => makeVodKey(v.courseId, v.title, v.week));
        saveDataToStorage('vod', all);
      });
      loadDataFromStorage<Assign[]>('assign', (stored) => {
        const all = [...(stored ?? [])];
        const seen = new Set(all.map((a) => makeItemKey(a.courseId, a.title, a.dueDate ?? '')));
        deduplicateInto(all, newAssigns, seen, (a) => makeItemKey(a.courseId, a.title, a.dueDate ?? ''));
        saveDataToStorage('assign', all);
      });
      loadDataFromStorage<Quiz[]>('quiz', (stored) => {
        const all = [...(stored ?? [])];
        const seen = new Set(all.map((q) => makeItemKey(q.courseId, q.title, q.dueDate ?? '')));
        deduplicateInto(all, newQuizzes, seen, (q) => makeItemKey(q.courseId, q.title, q.dueDate ?? ''));
        saveDataToStorage('quiz', all);
      });

      // State: 대시보드 표시용 필터링된 데이터만
      const filteredNewVods = filterVodsForDisplay(newVods);
      const filteredNewAssigns = filterItemsForDisplay(newAssigns);
      const filteredNewQuizzes = filterItemsForDisplay(newQuizzes);

      setVods((prev) => {
        const seen = new Set(prev.map((v) => makeVodKey(v.courseId, v.title, v.week)));
        const merged = [...prev];
        deduplicateInto(merged, filteredNewVods, seen, (v) => makeVodKey(v.courseId, v.title, v.week));
        return merged;
      });

      setAssigns((prev) => {
        const seen = new Set(prev.map((a) => makeItemKey(a.courseId, a.title, a.dueDate ?? '')));
        const merged = [...prev];
        deduplicateInto(merged, filteredNewAssigns, seen, (a) => makeItemKey(a.courseId, a.title, a.dueDate ?? ''));
        return merged;
      });

      setQuizzes((prev) => {
        const seen = new Set(prev.map((q) => makeItemKey(q.courseId, q.title, q.dueDate ?? '')));
        const merged = [...prev];
        deduplicateInto(merged, filteredNewQuizzes, seen, (q) => makeItemKey(q.courseId, q.title, q.dueDate ?? ''));
        return merged;
      });
    } catch (error) {
      console.warn('[Dotbugi] 강의 추가 데이터 fetch 실패:', error);
    } finally {
      setPendingCourseIds((prev) => {
        const next = new Set(prev);
        next.delete(course.courseId);
        return next;
      });
    }
  }, []);

  const removeCourseData = useCallback((courseId: string) => {
    // Storage: 전체 데이터에서 해당 강의 제거
    loadDataFromStorage<Vod[]>('vod', (stored) => {
      if (stored) saveDataToStorage('vod', stored.filter((v) => v.courseId !== courseId));
    });
    loadDataFromStorage<Assign[]>('assign', (stored) => {
      if (stored) saveDataToStorage('assign', stored.filter((a) => a.courseId !== courseId));
    });
    loadDataFromStorage<Quiz[]>('quiz', (stored) => {
      if (stored) saveDataToStorage('quiz', stored.filter((q) => q.courseId !== courseId));
    });

    // State: 대시보드에서 제거
    setVods((prev) => prev.filter((v) => v.courseId !== courseId));
    setAssigns((prev) => prev.filter((a) => a.courseId !== courseId));
    setQuizzes((prev) => prev.filter((q) => q.courseId !== courseId));
  }, []);

  // 캐시 TTL 기반 자동 갱신 타이머
  useEffect(() => {
    if (remainingTime >= CACHE_TTL_MINUTES) {
      refreshCourseData();
      return;
    }
    const timer = setTimeout(() => setRemainingTime((prev) => prev + 1), REFRESH_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [remainingTime, refreshCourseData]);

  // 탭이 다시 보일 때 캐시 만료 확인 후 즉시 갱신
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const lastRequest = getLastRequestTime();
      if (!lastRequest) return;
      const elapsed = Date.now() - lastRequest;
      if (elapsed >= CACHE_TTL_MS) {
        refreshCourseData();
      } else {
        setRemainingTime(elapsed / REFRESH_INTERVAL_MS);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshCourseData]);

  // 초기 로드: 캐시 확인 후 fetch 또는 캐시 사용 (최초 1회만 실행)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (!courses || courses.length === 0) return;
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

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
      loadDataFromStorage<Vod[]>('vod', (data) => {
        if (data) setVods(filterVodsForDisplay(data));
      });
      loadDataFromStorage<Assign[]>('assign', (data) => {
        if (data) setAssigns(filterItemsForDisplay(data));
      });
      loadDataFromStorage<Quiz[]>('quiz', (data) => {
        if (data) setQuizzes(filterItemsForDisplay(data));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  return {
    vods,
    assigns,
    quizzes,
    isPending,
    remainingTime,
    refreshTime,
    isError,
    refreshCourseData,
    addCourseData,
    removeCourseData,
    pendingCourseIds,
  };
}
