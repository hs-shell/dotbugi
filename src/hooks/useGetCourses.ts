import { CourseBase } from '@/types';
import { saveDataToStorage, loadDataFromStorage } from '@/lib/storage';
import { parseCoursesFromDOM } from '@/lib/parseCourses';
import { useState, useEffect, useCallback, useMemo } from 'react';

function getMockCourses(): CourseBase[] | null {
  const raw = import.meta.env.VITE_MOCK_COURSES;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // VITE_MOCK_COURSES 파싱 실패 (개발 환경에서만 발생)
  }
  return null;
}

// MOCK_COURSES 모드: chrome.storage 없이 환경 변수에 담긴 과목을 전부 트래킹한다. 빌드 시점에 정해지는 값이라 초기 state 로 쓴다.
const ENV_MOCK_COURSES = import.meta.env.VITE_MOCK ? getMockCourses() : null;

// onInitialized: 과목 목록과 추적 과목이 처음 정해진 시점에 추적 과목으로 호출된다 (초기 데이터 로드 연결용).
// 마운트 effect 의존성이므로 안정된 참조(useCallback)여야 한다 — 매 렌더 새 함수면 DOM 파싱·저장이 반복된다.
export const useGetCourses = (onInitialized?: (trackedCourses: CourseBase[]) => void) => {
  const [allCourses, setAllCourses] = useState<CourseBase[]>(() => ENV_MOCK_COURSES ?? []);
  const [trackedCourseIds, setTrackedCourseIdsState] = useState<string[] | null>(
    () => ENV_MOCK_COURSES?.map((c) => c.courseId) ?? null
  );

  const setTrackedCourseIds = useCallback((ids: string[]) => {
    setTrackedCourseIdsState(ids);
    saveDataToStorage('trackedCourseIds', ids);
  }, []);

  useEffect(() => {
    const initCourses = (courses: CourseBase[]) => {
      setAllCourses(courses);
      saveDataToStorage('courses', JSON.stringify(courses));

      loadDataFromStorage<string[]>('trackedCourseIds', (savedIds) => {
        if (!savedIds && courses.length === 0) return;

        loadDataFromStorage<string[]>('knownCourseIds', (knownIds) => {
          const knownSet = new Set(knownIds ?? []);

          if (savedIds) {
            const currentCourseIds = new Set(courses.map((c) => c.courseId));
            // 현재 강의 목록에 없는 과목은 추적에서 제거
            const filtered = savedIds.filter((id) => currentCourseIds.has(id));
            // 새로 추가된 과목 자동 추가
            const newTrackableIds = courses
              .filter((c) => !knownSet.has(c.courseId) && !c.isCommunity)
              .map((c) => c.courseId);
            const mergedIds = [...filtered, ...newTrackableIds];
            setTrackedCourseIdsState(mergedIds);
            onInitialized?.(courses.filter((c) => mergedIds.includes(c.courseId)));
            if (filtered.length !== savedIds.length || newTrackableIds.length > 0) {
              saveDataToStorage('trackedCourseIds', mergedIds);
            }
          } else if (courses.length > 0) {
            // 최초 사용: 비교과(커뮤니티)와 이전 학기 과목 제외하고 전부 트래킹
            const defaultIds = courses.filter((c) => !c.isCommunity).map((c) => c.courseId);
            setTrackedCourseIdsState(defaultIds);
            onInitialized?.(courses.filter((c) => defaultIds.includes(c.courseId)));
            saveDataToStorage('trackedCourseIds', defaultIds);
          }

          // 현재 과목 목록을 knownCourseIds로 저장
          if (courses.length > 0) {
            const updatedKnown = [...new Set([...knownSet, ...courses.map((c) => c.courseId)])];
            saveDataToStorage('knownCourseIds', updatedKnown);
          }
        });
      });
    };

    if (import.meta.env.VITE_MOCK) {
      // MOCK_COURSES 모드는 초기 state 에 이미 반영되어 있어 마운트가 곧 초기화 시점이다
      if (ENV_MOCK_COURSES) {
        onInitialized?.(ENV_MOCK_COURSES);
        return;
      }
      import('@/mocks/mockData').then(({ mockCourses }) => {
        initCourses(mockCourses);
      });
      return;
    }

    const parsed = parseCoursesFromDOM();
    initCourses(parsed);
  }, [onInitialized]);

  // DOM 토글에서 trackedCourseIds가 변경되면 React 상태 동기화
  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.trackedCourseIds) {
        const newIds = changes.trackedCourseIds.newValue as string[] | undefined;
        if (newIds) {
          setTrackedCourseIdsState(newIds);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const trackedCourses = useMemo(() => {
    if (!trackedCourseIds) return [];
    const idSet = new Set(trackedCourseIds);
    return allCourses.filter((c) => idSet.has(c.courseId));
  }, [allCourses, trackedCourseIds]);

  const isInitialized = trackedCourseIds !== null;

  return { allCourses, trackedCourses, trackedCourseIds: trackedCourseIds ?? [], isInitialized, setTrackedCourseIds };
};
