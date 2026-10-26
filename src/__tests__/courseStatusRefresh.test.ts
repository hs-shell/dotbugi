import { beforeEach, describe, expect, it, vi } from 'vitest';

import { injectCourseStatus } from '@/lib/courseStatus';
import { scrapeCourseData } from '@/lib/fetchCourseData';
import { loadAutoRefresh } from '@/lib/autoRefreshSetting';
import { load, loadCourseData, saveCourseData } from '@/lib/courseStatus/storage';
import { injectBadgesIntoDOM } from '@/lib/courseStatus/badge';
import { hideStatusBar, showStatusBar } from '@/lib/courseStatus/statusBar';
import { removeAutoRefreshBanner } from '@/lib/autoRefreshBanner';

vi.mock('@/lib/fetchCourseData', () => ({ scrapeCourseData: vi.fn() }));
vi.mock('@/lib/autoRefreshSetting', () => ({ loadAutoRefresh: vi.fn() }));
vi.mock('@/lib/courseStatus/badge', () => ({ injectBadgesIntoDOM: vi.fn() }));
vi.mock('@/lib/courseStatus/currentWeek', () => ({ highlightCurrentWeek: vi.fn() }));
vi.mock('@/lib/courseStatus/injectDownloadButtons', () => ({ injectDownloadButtons: vi.fn() }));
vi.mock('@/lib/courseStatus/statusBar', () => ({ showStatusBar: vi.fn(), hideStatusBar: vi.fn() }));
vi.mock('@/lib/courseStatus/storage', () => ({
  load: vi.fn(),
  loadCourseData: vi.fn(),
  loadAllData: vi.fn(async () => ({ vods: [], assigns: [], quizzes: [] })),
  saveCourseData: vi.fn(),
  saveSessionCourseData: vi.fn(),
  loadSessionCourseData: vi.fn(() => null),
  isFetchCacheValid: vi.fn(() => false),
  setFetchCache: vi.fn(),
}));

const COURSE_ID = '42';
const STORED_VOD = { courseId: COURSE_ID, title: '저장된 강의' };
const EMPTY_SCRAPE = { vodDataArray: [], vodAttendanceArray: [], assignDataArray: [], quizDataArray: [] };

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const bannerLink = () => document.querySelector<HTMLAnchorElement>('#dotbugi-auto-refresh-banner a');

beforeEach(() => {
  vi.clearAllMocks();
  removeAutoRefreshBanner();
  window.history.pushState({}, '', `/course/view.php?id=${COURSE_ID}`);
  // 추적 중인 과목
  vi.mocked(load).mockImplementation(async (key: string) => (key === 'trackedCourseIds' ? [COURSE_ID] : null));
  vi.mocked(loadCourseData).mockResolvedValue({
    vods: [STORED_VOD],
    assigns: [],
    quizzes: [],
    hiddenUrls: new Set(),
  } as never);
});

describe('강의 상세 페이지 — 자동 새로고침 꺼짐', () => {
  it('저장된 데이터만 표시하고 조회하지 않으며, 배너의 새로고침 링크로 수동 조회한다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(false);
    vi.mocked(scrapeCourseData).mockResolvedValue(EMPTY_SCRAPE as never);

    await injectCourseStatus();
    await flush();

    expect(injectBadgesIntoDOM).toHaveBeenCalledWith([STORED_VOD], [], [], expect.any(Set));
    expect(scrapeCourseData).not.toHaveBeenCalled();
    expect(showStatusBar).not.toHaveBeenCalled();

    bannerLink()!.click();
    await flush();
    await flush();

    expect(scrapeCourseData).toHaveBeenCalledWith(COURSE_ID, [], false, expect.any(AbortSignal));
    expect(saveCourseData).toHaveBeenCalledOnce();
    expect(bannerLink()).not.toBeNull();
  });
});

describe('강의 상세 페이지 — 페이지 이동 시 중단', () => {
  it('조회 중 페이지를 떠나면 요청을 중단하고, 저장·오류 표시 없이 상태 바를 원래대로 숨긴다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    vi.mocked(scrapeCourseData).mockImplementation(async (_id, _q, _c, signal) => {
      window.dispatchEvent(new Event('beforeunload'));
      signal!.throwIfAborted();
      return EMPTY_SCRAPE as never;
    });

    await injectCourseStatus();
    await flush();
    await flush();

    expect(scrapeCourseData).toHaveBeenCalled();
    expect(saveCourseData).not.toHaveBeenCalled();
    expect(showStatusBar).not.toHaveBeenCalledWith('error');
    expect(hideStatusBar).toHaveBeenCalled();
  });
});
