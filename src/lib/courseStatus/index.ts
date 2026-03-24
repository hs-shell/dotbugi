import { CourseBase, Quiz } from '@/types';
import { scrapeCourseData } from '@/lib/fetchCourseData';
import { mergeVodWithAttendance, mergeDueDateItems } from '@/lib/transformCourseData';
import { logger } from '@/lib/logger';

import {
  load,
  loadCourseData,
  loadAllData,
  saveCourseData,
  saveSessionCourseData,
  loadSessionCourseData,
  isFetchCacheValid,
  setFetchCache,
} from './storage';
import { injectBadgesIntoDOM } from './badge';
import { highlightCurrentWeek } from './currentWeek';
import { showStatusBar } from './statusBar';

// Course info from DOM

function parseCourseInfoFromDOM(courseId: string): CourseBase {
  const prof = document.querySelector('.course-header .media-heading')?.textContent?.trim() ?? '';
  const courseTitle =
    document.querySelector('.coursename h1 a')?.textContent?.trim() ??
    document.querySelector('.page-header-headings h1')?.textContent?.trim() ??
    '';
  return { courseId, courseTitle, prof };
}

// Fetch & inject

async function fetchAndInject(courseId: string, course: CourseBase, isTracked: boolean, isCommunity: boolean) {
  showStatusBar('loading');

  const [hiddenUrls, cachedQuizzes] = await Promise.all([
    load<string[]>('hiddenTaskUrls'),
    load<Quiz[]>('quiz').then((all) => (all ?? []).filter((q) => q.courseId === courseId)),
  ]);

  try {
    const scraped = await scrapeCourseData(courseId, cachedQuizzes, isCommunity);
    const newVods = mergeVodWithAttendance(course, scraped.vodDataArray, scraped.vodAttendanceArray);
    const newAssigns = mergeDueDateItems(course, scraped.assignDataArray);
    const newQuizzes = mergeDueDateItems(course, scraped.quizDataArray);

    if (isTracked) {
      // 트래킹 강좌: chrome.storage에 영구 저장
      const all = await loadAllData();
      saveCourseData(courseId, newVods, newAssigns, newQuizzes, all);
    } else {
      // 비트래킹 강좌: sessionStorage에 임시 캐시 (탭 닫으면 소멸)
      saveSessionCourseData(courseId, newVods, newAssigns, newQuizzes);
    }

    injectBadgesIntoDOM(newVods, newAssigns, newQuizzes, new Set(hiddenUrls ?? []));
    setFetchCache(courseId);
    showStatusBar('success');
  } catch (error) {
    logger.error('강의 데이터 로드 오류:', error);
    showStatusBar('error');
  }
}

// Main entry point

export async function injectCourseStatus() {
  const match = window.location.href.match(/\/course\/view\.php\?id=(\d+)/);
  if (!match) return;

  const courseId = match[1];

  highlightCurrentWeek();

  const [trackedIds, communityIds] = await Promise.all([
    load<string[]>('trackedCourseIds'),
    load<string[]>('communityIds'),
  ]);
  const isTracked = trackedIds?.includes(courseId) ?? false;
  const isCommunity = communityIds?.includes(courseId) ?? false;

  // 뒤로가기/앞으로가기 → 캐시 사용
  if (isFetchCacheValid(courseId)) {
    if (isTracked) {
      const data = await loadCourseData(courseId);
      if (data.vods.length || data.assigns.length || data.quizzes.length) {
        injectBadgesIntoDOM(data.vods, data.assigns, data.quizzes, data.hiddenUrls);
        return;
      }
    } else {
      const cached = loadSessionCourseData(courseId);
      if (cached) {
        const hiddenUrls = await load<string[]>('hiddenTaskUrls');
        injectBadgesIntoDOM(cached.vods, cached.assigns, cached.quizzes, new Set(hiddenUrls ?? []));
        return;
      }
    }
  }

  // 트래킹 강의 → 저장된 데이터로 빠른 초기 렌더링
  if (isTracked) {
    const data = await loadCourseData(courseId);
    if (data.vods.length || data.assigns.length || data.quizzes.length) {
      injectBadgesIntoDOM(data.vods, data.assigns, data.quizzes, data.hiddenUrls);
    }
  }

  // 최신 데이터 fetch
  fetchAndInject(courseId, parseCourseInfoFromDOM(courseId), isTracked, isCommunity);
}
