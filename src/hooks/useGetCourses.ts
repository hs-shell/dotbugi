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
    console.error('[Dotbugi] VITE_MOCK_COURSES 파싱 실패');
  }
  return null;
}

export const useGetCourses = () => {
  const [allCourses, setAllCourses] = useState<CourseBase[]>([]);
  const [trackedCourseIds, setTrackedCourseIdsState] = useState<string[] | null>(null);

  const setTrackedCourseIds = useCallback((ids: string[]) => {
    setTrackedCourseIdsState(ids);
    saveDataToStorage('trackedCourseIds', ids);
  }, []);

  useEffect(() => {
    const initCourses = (courses: CourseBase[]) => {
      setAllCourses(courses);
      saveDataToStorage('courses', JSON.stringify(courses));

      loadDataFromStorage<string[]>('trackedCourseIds', (savedIds) => {
        if (savedIds && savedIds.length > 0) {
          setTrackedCourseIdsState(savedIds);
        } else {
          // 최초 사용: 비교과(커뮤니티) 제외하고 전부 트래킹
          const defaultIds = courses
            .filter((c) => !c.isCommunity)
            .map((c) => c.courseId);
          setTrackedCourseIdsState(defaultIds);
          saveDataToStorage('trackedCourseIds', defaultIds);
        }
      });
    };

    if (import.meta.env.VITE_MOCK) {
      const envCourses = getMockCourses();
      if (envCourses) {
        initCourses(envCourses);
        return;
      }
      import('@/mocks/mockData').then(({ mockCourses }) => {
        initCourses(mockCourses);
      });
      return;
    }

    const parsed = parseCoursesFromDOM();
    initCourses(parsed);
  }, []);

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

  return { allCourses, trackedCourses, trackedCourseIds: trackedCourseIds ?? [], setTrackedCourseIds };
};
