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
