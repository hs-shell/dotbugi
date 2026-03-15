import { CourseBase } from '@/content/types';
import { saveDataToStorage } from '@/lib/storage';
import { removeSquareBrackets } from '@/lib/utils';
import { useState, useEffect } from 'react';

export const useGetCourses = () => {
  const [courses, setCourses] = useState<CourseBase[]>([]);

  useEffect(() => {
    if (import.meta.env.VITE_MOCK) {
      import('@/mocks/mockData').then(({ mockCourses }) => {
        setCourses(mockCourses);
        saveDataToStorage('courses', JSON.stringify(mockCourses));
        console.info('[Dotbugi] DEV 모드: mock 강의 목록 사용');
      });
      return;
    }

    if (!document) return;

    const data = Array.from(document.querySelectorAll('.course_box'))
      .map((div) => {
        const label = div.querySelector('.course_link .course-name .course-label')?.textContent?.trim();
        if (!label || label === '커뮤니티') return null;

        const a = div.querySelector('a') as HTMLAnchorElement;
        const courseId = new URL(a.href).searchParams.get('id') || '';
        const titleSection = div.querySelector('.course_link .course-name .course-title');
        const prof = titleSection?.querySelector('p')?.textContent?.trim() || '';
        const courseTitle = removeSquareBrackets(
          titleSection?.querySelector('h1, h2, h3')?.textContent?.replace(/new/i, '').trim() || ''
        );

        return courseId && courseTitle && prof ? { courseId, courseTitle, prof } : null;
      })
      .filter((item): item is CourseBase => item !== null);

    setCourses(data);
    saveDataToStorage('courses', JSON.stringify(data));
    console.info('[Dotbugi] 강의 목록:', data);
  }, []);

  return { courses };
};
