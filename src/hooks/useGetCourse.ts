import { CourseBase } from '@/content/types';
import { saveDataToStorage } from '@/lib/storage';
import { removeSquareBrackets } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface UseCouresResult {
  courses: CourseBase[];
}

export const useGetCourses = (): UseCouresResult => {
  const [courses, setCourses] = useState<CourseBase[]>([]);
  useEffect(() => {
    if (!document) return;
    const courseData = Array.from(document.querySelectorAll('.course_box'));
    const data = courseData
      .map((div) => {
        const label = div.querySelector('.course_link .course-name .course-label')?.textContent?.trim() || null;
        if (!label || label === '커뮤니티') return null;
        const a = div.querySelector('a');
        const url = new URL((a as HTMLAnchorElement).href);
        const urlParams = new URLSearchParams(url.search);
        const courseId = urlParams.get('id') || '';
        const titleSection = div.querySelector('.course_link .course-name .course-title');
        const prof = titleSection?.querySelector('p')?.textContent?.trim() || '';
        let courseTitle = titleSection?.querySelector('h1, h2, h3')?.textContent?.replace(/new/i, '').trim() || '';
        courseTitle = removeSquareBrackets(courseTitle);
        return { courseId, courseTitle, prof };
      })
      .filter(
        (item): item is { courseId: string; courseTitle: string; prof: string } =>
          item !== null && item.courseId !== '' && item.courseTitle !== '' && item.prof !== ''
      );

    setCourses(data);
    saveDataToStorage('courses', JSON.stringify(data));
    console.info('[Dotbugi] 강의 목록:', data);
  }, []);

  return { courses };
};
