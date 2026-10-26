import { CourseBase, Quiz } from '@/types';
import { scrapeCourseData } from '@/lib/fetchCourseData';
import { mergeVodWithAttendance, mergeDueDateItems } from '@/lib/transformCourseData';
import { logger } from '@/lib/logger';
import { abortOnLeave } from '@/lib/abortOnLeave';
import { loadAutoRefresh } from '@/lib/autoRefreshSetting';
import { renderAutoRefreshBanner } from '@/lib/autoRefreshBanner';
import { getLastRequestTime } from '@/lib/cache';

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
import { showStatusBar, hideStatusBar } from './statusBar';
import { injectDownloadButtons } from './injectDownloadButtons';

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

type FetchState = 'loading' | 'success' | 'error' | 'aborted';

/** 자동 새로고침이 켜져 있을 때의 진행 표시 — 잠깐 떴다 사라지는 상태 바 */
const reportToStatusBar = (state: FetchState) => (state === 'aborted' ? hideStatusBar() : showStatusBar(state));

async function fetchAndInject(
  courseId: string,
  course: CourseBase,
  isTracked: boolean,
  isCommunity: boolean,
  report: (state: FetchState) => void = reportToStatusBar
) {
  report('loading');
  const { signal, dispose } = abortOnLeave();

  const [hiddenUrls, cachedQuizzes] = await Promise.all([
    load<string[]>('hiddenTaskUrls'),
    load<Quiz[]>('quiz').then((all) => (all ?? []).filter((q) => q.courseId === courseId)),
  ]);

  try {
    const scraped = await scrapeCourseData(courseId, cachedQuizzes, isCommunity, signal);
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
    report('success');
  } catch (error) {
    // 페이지 이동으로 중단: 아무것도 저장하지 않았으므로 이미 표시한 저장 데이터가 그대로 이전 상태다
    if (signal.aborted) {
      report('aborted');
      return;
    }
    logger.course.error('강의 데이터 로드 오류:', error);
    report('error');
  } finally {
    dispose();
  }
}

/** 자동 새로고침 꺼짐: 상단 배너를 띄우고, 배너의 새로고침 링크로만 조회한다 */
function showManualRefreshBanner(courseId: string, isTracked: boolean, isCommunity: boolean) {
  const lastRequest = getLastRequestTime();
  let lastRefreshed = lastRequest ? new Date(lastRequest).toLocaleTimeString() : null;

  const refresh = () =>
    fetchAndInject(courseId, parseCourseInfoFromDOM(courseId), isTracked, isCommunity, (state) => {
      if (state === 'success') lastRefreshed = new Date().toLocaleTimeString();
      renderAutoRefreshBanner(lastRefreshed, state === 'loading' || state === 'error' ? state : 'idle', refresh);
    });
  renderAutoRefreshBanner(lastRefreshed, 'idle', refresh);
}

// Main entry point

export async function injectCourseStatus() {
  const match = window.location.href.match(/\/course\/view\.php\?id=(\d+)/);
  if (!match) return;

  const courseId = match[1];

  highlightCurrentWeek();
  injectDownloadButtons(parseCourseInfoFromDOM(courseId).courseTitle);

  const [trackedIds, communityIds, autoRefresh] = await Promise.all([
    load<string[]>('trackedCourseIds'),
    load<string[]>('communityIds'),
    loadAutoRefresh(),
  ]);
  const isTracked = trackedIds?.includes(courseId) ?? false;
  const isCommunity = communityIds?.includes(courseId) ?? false;

  // 뒤로가기/앞으로가기 → 캐시 사용
  if (autoRefresh && isFetchCacheValid(courseId)) {
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

  if (!autoRefresh) {
    // 비트래킹 강의는 이 탭에서 마지막으로 조회한 임시 캐시가 저장 데이터다
    const cached = isTracked ? null : loadSessionCourseData(courseId);
    if (cached) {
      const hiddenUrls = await load<string[]>('hiddenTaskUrls');
      injectBadgesIntoDOM(cached.vods, cached.assigns, cached.quizzes, new Set(hiddenUrls ?? []));
    }
    showManualRefreshBanner(courseId, isTracked, isCommunity);
    return;
  }

  // 최신 데이터 fetch
  fetchAndInject(courseId, parseCourseInfoFromDOM(courseId), isTracked, isCommunity);
}
