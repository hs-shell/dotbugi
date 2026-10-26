import { beforeEach, describe, expect, it, vi } from 'vitest';

import { injectCourseStatus } from '@/lib/courseStatus';
import { scrapeCourseData } from '@/lib/fetchCourseData';
import { loadAutoRefresh } from '@/lib/autoRefreshSetting';
import {
  isFetchCacheValid,
  load,
  loadCourseData,
  loadSessionCourseData,
  saveCourseData,
  saveSessionCourseData,
  setFetchCache,
} from '@/lib/courseStatus/storage';
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

describe('강의 상세 페이지 — 자동 새로고침 켜짐', () => {
  beforeEach(() => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
  });

  it('강의 페이지가 아니면 아무것도 하지 않는다', async () => {
    window.history.pushState({}, '', '/my/');
    await injectCourseStatus();
    expect(load).not.toHaveBeenCalled();
  });

  it('추적 과목은 저장 데이터를 먼저 보여 준 뒤 새로 조회해 저장하고, 강의 제목·교수를 페이지에서 읽는다', async () => {
    document.body.innerHTML =
      '<div class="course-header"><h4 class="media-heading"> 김교수 </h4></div><div class="coursename"><h1><a> 자료구조 </a></h1></div>';
    vi.mocked(scrapeCourseData).mockResolvedValue({
      ...EMPTY_SCRAPE,
      assignDataArray: [{ title: '과제', url: 'a', isSubmit: false, dueDate: null }],
    } as never);

    await injectCourseStatus();
    await flush();

    expect(injectBadgesIntoDOM).toHaveBeenNthCalledWith(1, [STORED_VOD], [], [], expect.any(Set));
    expect(vi.mocked(saveCourseData).mock.calls[0][2]).toEqual([
      {
        courseId: COURSE_ID,
        courseTitle: '자료구조',
        prof: '김교수',
        title: '과제',
        url: 'a',
        isSubmit: false,
        dueDate: null,
      },
    ]);
    expect(setFetchCache).toHaveBeenCalledWith(COURSE_ID);
    expect(showStatusBar).toHaveBeenLastCalledWith('success');
    document.body.innerHTML = '';
  });

  it('추적하지 않는 과목은 결과를 탭 sessionStorage 에만 임시 저장한다', async () => {
    vi.mocked(load).mockResolvedValue(null);
    vi.mocked(scrapeCourseData).mockResolvedValue(EMPTY_SCRAPE as never);

    await injectCourseStatus();
    await flush();

    expect(saveSessionCourseData).toHaveBeenCalledWith(COURSE_ID, [], [], []);
    expect(saveCourseData).not.toHaveBeenCalled();
  });

  it('조회에 실패하면 오류 상태 바를 띄운다', async () => {
    vi.mocked(scrapeCourseData).mockRejectedValue(new Error('500'));
    await injectCourseStatus();
    await flush();
    expect(showStatusBar).toHaveBeenLastCalledWith('error');
  });

  it('뒤로/앞으로 이동이고 캐시가 유효하면 저장 데이터만 보여 주고 다시 조회하지 않는다', async () => {
    vi.mocked(isFetchCacheValid).mockReturnValueOnce(true);
    await injectCourseStatus();
    await flush();

    expect(injectBadgesIntoDOM).toHaveBeenCalledTimes(1);
    expect(scrapeCourseData).not.toHaveBeenCalled();
  });

  it('추적하지 않는 과목도 탭 캐시가 있으면 그것으로 보여 주고 다시 조회하지 않는다', async () => {
    vi.mocked(load).mockImplementation(async (key: string) => (key === 'hiddenTaskUrls' ? ['h'] : null));
    vi.mocked(isFetchCacheValid).mockReturnValueOnce(true);
    vi.mocked(loadSessionCourseData).mockReturnValueOnce({ vods: [], assigns: [], quizzes: [] });

    await injectCourseStatus();
    await flush();

    expect(injectBadgesIntoDOM).toHaveBeenCalledWith([], [], [], new Set(['h']));
    expect(scrapeCourseData).not.toHaveBeenCalled();
  });
});
