import { CourseBase } from '@/types';
import { removeSquareBrackets } from '@/lib/utils';

// course_label_ec = 커뮤니티(비교과), 클래스 기반 필터링으로 다국어 대응
const COMMUNITY_CLASS = 'course_label_ec';

function parseCourseFromElement(li: Element): CourseBase | null {
  const link = li.querySelector('a.course_link') as HTMLAnchorElement | null;
  if (!link) return null;

  const courseId = new URL(link.href).searchParams.get('id');
  const titleEl = link.querySelector('.course-title');
  const prof = titleEl?.querySelector('p')?.textContent?.trim();
  const rawTitle = titleEl?.querySelector('h1, h2, h3')?.textContent?.replace(/new/i, '').trim();
  const courseTitle = rawTitle ? removeSquareBrackets(rawTitle) : '';

  if (!courseId || !courseTitle || !prof) return null;
  return { courseId, courseTitle, prof };
}

export function parseCoursesFromDOM(): CourseBase[] {
  return Array.from(document.querySelectorAll('.my-course-lists > li'))
    .filter((li) => !li.classList.contains(COMMUNITY_CLASS))
    .flatMap((li) => parseCourseFromElement(li) ?? []);
}
