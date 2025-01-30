import { CourseBase } from '@/content/types';
import { useState, useEffect } from 'react';

interface UseCouresResult {
  courses: CourseBase[];
}

export const useGetCourses = (): UseCouresResult => {
  const [courses, setCourses] = useState<CourseBase[]>([]);
  useEffect(() => {
    // if (!document) return;
    // const courseData = Array.from(document.querySelectorAll('.course_box'));
    // const data = courseData
    //   .map((div) => {
    //     const a = div.querySelector('a');
    //     const url = new URL((a as HTMLAnchorElement).href);
    //     const urlParams = new URLSearchParams(url.search);
    //     const courseId = urlParams.get('id') || '';
    //     const titleSection = div.querySelector('.course_link .course-name .course-title');
    //     const prof = titleSection?.querySelector('p')?.textContent?.trim() || '';
    //     const courseTitle = titleSection?.querySelector('h1, h2, h3')?.textContent?.replace(/new/i, '').trim() || '';
    //     return { courseId, courseTitle, prof };
    //   })
    //   .filter((item) => item.courseId !== '' && item.courseTitle !== '' && item.prof !== '');
    // setCourses(data);
    setCourses([{ courseId: '32153', courseTitle: '프로그래밍언어론', prof: '김성동' }]);
  }, []);

  return { courses };
};
