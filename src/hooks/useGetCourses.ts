import { CourseBase } from '@/types';
import { saveDataToStorage } from '@/lib/storage';
import { parseCoursesFromDOM } from '@/lib/parseCourses';
import { useState, useEffect } from 'react';

export const useGetCourses = () => {
  const [courses, setCourses] = useState<CourseBase[]>([]);

  useEffect(() => {
    if (import.meta.env.VITE_MOCK) {
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
