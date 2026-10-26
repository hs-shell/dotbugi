import { act, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCourseData } from '@/hooks/useCourseData';
import { scrapeCourseData } from '@/lib/fetchCourseData';
import { loadAutoRefresh, REFRESH_REQUEST_KEY } from '@/lib/autoRefreshSetting';
import { saveDataToStorage } from '@/lib/storage';
import { CACHE_TTL_MS, getLastRequestTime, setLastRequestTime } from '@/lib/cache';
import type { CourseBase, Vod } from '@/types';

vi.mock('@/lib/fetchCourseData', () => ({ scrapeCourseData: vi.fn() }));
vi.mock('@/lib/autoRefreshSetting', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/autoRefreshSetting')>()),
  loadAutoRefresh: vi.fn(),
  saveAutoRefresh: vi.fn(),
}));

const stored: Record<string, unknown> = {};
vi.mock('@/lib/storage', () => ({
  loadDataFromStorage: (key: string, cb: (data: unknown) => void) => cb(stored[key] ?? null),
  saveDataToStorage: vi.fn(),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const COURSE: CourseBase = { courseId: '1', courseTitle: '자료구조', prof: '교수' };
const STORED_VOD = {
  courseId: '1',
  title: '저장된 강의',
  week: 1,
  range: '2024-01-01 00:00:00 ~ 2099-12-31 23:59:00',
} as unknown as Vod;
const EMPTY_SCRAPE = { vodDataArray: [], vodAttendanceArray: [], assignDataArray: [], quizDataArray: [] };
// 캐시 만료(1시간 초과) 상태
const STALE_TIME = Date.now() - CACHE_TTL_MS - 60_000;

let root: Root;
let result: ReturnType<typeof useCourseData>;

function Harness({ courses }: { courses: CourseBase[] }) {
  const value = useCourseData(courses);
  // 렌더 중 바깥 변수를 바꾸지 않도록 커밋 후에 꺼낸다
  useEffect(() => {
    result = value;
  });
  return null;
}

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 10)));

async function mountAndLoad() {
  root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Harness courses={[COURSE]} />));
  await act(async () => result.loadInitialData([COURSE]));
  await settle();
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(stored).forEach((k) => delete stored[k]);
  stored.vod = [STORED_VOD];
  localStorage.clear();
  sessionStorage.clear();
  setLastRequestTime(STALE_TIME);
  vi.mocked(scrapeCourseData).mockResolvedValue(EMPTY_SCRAPE as never);
});

afterEach(() => {
  act(() => root.unmount());
});

describe('useCourseData — 자동 새로고침 설정', () => {
  it('켜져 있으면 캐시가 만료됐을 때 새로고침한다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    await mountAndLoad();
    expect(scrapeCourseData).toHaveBeenCalled();
  });

  it('꺼져 있으면 캐시가 만료돼도 새로고침하지 않고 저장된 데이터를 표시한다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(false);
    await mountAndLoad();
    expect(scrapeCourseData).not.toHaveBeenCalled();
    expect(result.vods).toEqual([STORED_VOD]);
    expect(result.autoRefresh).toBe(false);
  });

  it('꺼져 있어도 다른 페이지 배너에서 요청한 새로고침은 한 번 수행한다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(false);
    sessionStorage.setItem(REFRESH_REQUEST_KEY, '1');
    await mountAndLoad();
    expect(scrapeCourseData).toHaveBeenCalled();
    expect(sessionStorage.getItem(REFRESH_REQUEST_KEY)).toBeNull();
  });
});

describe('useCourseData — 페이지 이동 시 중단', () => {
  it('새로고침 중 페이지를 떠나면 저장하지 않고 이전 데이터로 되돌린다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    vi.mocked(scrapeCourseData).mockImplementation(async (_id, _q, _c, signal) => {
      window.dispatchEvent(new Event('beforeunload'));
      signal!.throwIfAborted();
      return EMPTY_SCRAPE as never;
    });

    await mountAndLoad();

    expect(scrapeCourseData).toHaveBeenCalledWith('1', undefined, undefined, expect.any(AbortSignal));
    expect(saveDataToStorage).not.toHaveBeenCalled();
    expect(result.vods).toEqual([STORED_VOD]);
    expect(result.isPending).toBe(false);
    expect(result.isError).toBe(false);
    expect(getLastRequestTime()).toBe(STALE_TIME);
  });
});

const NOW_RANGE = '2024-01-01 00:00:00 ~ 2099-12-31 23:59:00';
const scrapeWith = (title: string, assignDue: string | null = '2099-01-01 00:00') => ({
  vodDataArray: [{ week: 1, subject: '1주차', title, url: `u-${title}`, range: NOW_RANGE, length: '10:00' }],
  vodAttendanceArray: [{ week: 1, title, isAttendance: 'X', weeklyAttendance: 'X' }],
  assignDataArray: [
    { title: '진행중 과제', url: 'a1', isSubmit: false, dueDate: assignDue },
    { title: '지난 과제', url: 'a2', isSubmit: false, dueDate: '2020-01-01 00:00' },
  ],
  quizDataArray: [],
});
const savedOf = (key: string) =>
  vi
    .mocked(saveDataToStorage)
    .mock.calls.filter(([k]) => k === key)
    .at(-1)?.[1];

describe('useCourseData — 새로고침 결과 반영', () => {
  it('추적 과목의 새 데이터로 저장소를 교체하고, 화면에는 기간이 지난 과제를 빼고 보여 준다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    // 추적하지 않는 과목(2)의 예전 데이터는 저장소에서 정리된다
    stored.vod = [STORED_VOD, { ...STORED_VOD, courseId: '2', title: '지난 학기' }];
    vi.mocked(scrapeCourseData).mockResolvedValue(scrapeWith('새 강의') as never);

    await mountAndLoad();

    expect((savedOf('vod') as Vod[]).map((v) => v.title)).toEqual(['새 강의']);
    expect((savedOf('assign') as { title: string }[]).map((a) => a.title)).toEqual(['진행중 과제', '지난 과제']);
    expect(result.vods.map((v) => v.title)).toEqual(['새 강의']);
    expect(result.assigns.map((a) => a.title)).toEqual(['진행중 과제']);
    expect(result.isPending).toBe(false);
    expect(result.remainingTime).toBe(0);
    expect(getLastRequestTime()).toBeGreaterThan(STALE_TIME);
  });

  it('가져오기에 실패하면 오류 상태로 두고 마지막 새로고침 시각을 지워 다음에 다시 시도하게 한다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    vi.mocked(scrapeCourseData).mockRejectedValue(new Error('500'));

    await mountAndLoad();

    expect(result.isError).toBe(true);
    expect(result.isPending).toBe(false);
    expect(getLastRequestTime()).toBeNull();
    expect(saveDataToStorage).not.toHaveBeenCalled();
  });

  it('캐시가 아직 유효하면 가져오지 않고 경과 시간(분)을 이어서 센다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    setLastRequestTime(Date.now() - 10 * 60_000);
    await mountAndLoad();

    expect(scrapeCourseData).not.toHaveBeenCalled();
    expect(Math.round(result.remainingTime)).toBe(10);
    expect(result.vods).toEqual([STORED_VOD]);
  });

  it('탭이 다시 보일 때 캐시가 만료됐으면 바로 새로고침한다', async () => {
    vi.mocked(loadAutoRefresh).mockResolvedValue(true);
    setLastRequestTime(Date.now() - 10 * 60_000);
    await mountAndLoad();

    setLastRequestTime(STALE_TIME);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    await settle();
    visibility.mockRestore();

    expect(scrapeCourseData).toHaveBeenCalledTimes(1);
  });
});

describe('useCourseData — 과목 추가·제거', () => {
  const COURSE2: CourseBase = { courseId: '2', courseTitle: '운영체제', prof: '교수' };

  async function mountOnly() {
    vi.mocked(loadAutoRefresh).mockResolvedValue(false);
    root = createRoot(document.createElement('div'));
    await act(async () => root.render(<Harness courses={[COURSE, COURSE2]} />));
  }

  it('추가한 과목의 데이터를 중복 없이 저장·표시하고, 첫 추가면 새로고침 시각을 기록한다', async () => {
    vi.mocked(scrapeCourseData).mockResolvedValue(scrapeWith('OS 1강') as never);
    await mountOnly();

    await act(async () => result.addCourseData(COURSE2));
    await act(async () => result.addCourseData(COURSE2));

    expect(scrapeCourseData).toHaveBeenCalledWith('2', undefined, undefined, expect.any(AbortSignal));
    expect((savedOf('vod') as Vod[]).map((v) => [v.courseId, v.title])).toEqual([
      ['1', '저장된 강의'],
      ['2', 'OS 1강'],
    ]);
    expect(result.vods.map((v) => v.title)).toEqual(['OS 1강']);
    expect(result.assigns.map((a) => a.title)).toEqual(['진행중 과제']);
    expect(result.pendingCourseIds.size).toBe(0);
    expect(result.refreshTime).not.toBeNull();
  });

  it('추가 중 가져오기에 실패해도 대기 표시를 정리한다', async () => {
    vi.mocked(scrapeCourseData).mockRejectedValue(new Error('x'));
    await mountOnly();
    await act(async () => result.addCourseData(COURSE2));
    expect(result.pendingCourseIds.size).toBe(0);
    expect(result.vods).toEqual([]);
  });

  it('제거한 과목의 데이터를 저장소와 화면에서 지운다', async () => {
    vi.mocked(scrapeCourseData).mockResolvedValue(scrapeWith('OS 1강') as never);
    await mountOnly();
    await act(async () => result.addCourseData(COURSE2));

    stored.assign = [{ courseId: '2', title: 'x' }];
    stored.quiz = [{ courseId: '1', title: 'q' }];
    await act(async () => result.removeCourseData('2'));

    expect(savedOf('vod')).toEqual([STORED_VOD]);
    expect(savedOf('assign')).toEqual([]);
    expect(savedOf('quiz')).toEqual([{ courseId: '1', title: 'q' }]);
    expect(result.vods).toEqual([]);
    expect(result.assigns).toEqual([]);
  });

  it('자동 새로고침 설정을 바꾸면 저장한다', async () => {
    await mountOnly();
    const { saveAutoRefresh } = await import('@/lib/autoRefreshSetting');
    await act(async () => result.setAutoRefresh(true));
    expect(result.autoRefresh).toBe(true);
    expect(saveAutoRefresh).toHaveBeenCalledWith(true);
  });
});
