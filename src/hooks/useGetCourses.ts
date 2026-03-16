import { CourseBase } from '@/types';
import { saveDataToStorage } from '@/lib/storage';
import { parseCoursesFromDOM } from '@/lib/parseCourses';
import { useState, useEffect } from 'react';

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
  const [courses, setCourses] = useState<CourseBase[]>([]);

  useEffect(() => {
    if (import.meta.env.VITE_MOCK) {
      const envCourses = getMockCourses();
      if (envCourses) {
        // env에 과목이 지정되어 있으면 실제 fetch용으로 사용
        setCourses(envCourses);
        saveDataToStorage('courses', JSON.stringify(envCourses));
        return;
      }
      // 없으면 기존 하드코딩 mock 사용
      import('@/mocks/mockData').then(({ mockCourses }) => {
        setCourses(mockCourses);
        saveDataToStorage('courses', JSON.stringify(mockCourses));
      });
      return;
    }

    const parsed = parseCoursesFromDOM();
    setCourses(parsed);
    saveDataToStorage('courses', JSON.stringify(parsed));
  }, []);

  return { courses };
};
