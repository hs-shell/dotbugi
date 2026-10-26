import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isFetchCacheValid,
  loadAllData,
  loadCourseData,
  loadSessionCourseData,
  saveCourseData,
  saveSessionCourseData,
  setFetchCache,
} from '@/lib/courseStatus/storage';
import type { Assign, Quiz, Vod } from '@/types';

const mockStorage: Record<string, unknown> = {};

const vod = (courseId: string, title: string) => ({ courseId, title }) as unknown as Vod;
const assign = (courseId: string, title: string) => ({ courseId, title }) as unknown as Assign;
const quiz = (courseId: string, title: string) => ({ courseId, title }) as unknown as Quiz;

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  sessionStorage.clear();
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        set: vi.fn((items: Record<string, unknown>) => Object.assign(mockStorage, items)),
        get: vi.fn((keys: string[], cb: (result: Record<string, unknown>) => void) => {
          cb(Object.fromEntries(keys.filter((k) => k in mockStorage).map((k) => [k, mockStorage[k]])));
        }),
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('loadCourseData', () => {
  it('해당 강좌의 항목만 걸러 오고 숨긴 URL 을 Set 으로 돌려준다', async () => {
    mockStorage.vod = [vod('1', 'v1'), vod('2', 'v2')];
    mockStorage.assign = [assign('2', 'a2')];
    mockStorage.quiz = [quiz('1', 'q1')];
    mockStorage.hiddenTaskUrls = ['u1'];

    const data = await loadCourseData('1');
    expect(data.vods.map((v) => v.title)).toEqual(['v1']);
    expect(data.assigns).toEqual([]);
    expect(data.quizzes.map((q) => q.title)).toEqual(['q1']);
    expect(data.hiddenUrls.has('u1')).toBe(true);
  });

  it('저장된 데이터가 없으면 빈 목록', async () => {
    const data = await loadCourseData('1');
    expect(data).toEqual({ vods: [], assigns: [], quizzes: [], hiddenUrls: new Set() });
    await expect(loadAllData()).resolves.toEqual({ vods: [], assigns: [], quizzes: [] });
  });
});

describe('saveCourseData', () => {
  it('해당 강좌의 기존 항목만 새 항목으로 바꾸고 다른 강좌 항목은 유지한다', async () => {
    mockStorage.vod = [vod('1', 'old'), vod('2', 'keep')];
    mockStorage.assign = [assign('1', 'oldA')];
    mockStorage.quiz = [];
    const all = await loadAllData();

    saveCourseData('1', [vod('1', 'new')], [], [quiz('1', 'q')], all);

    expect((mockStorage.vod as Vod[]).map((v) => v.title)).toEqual(['keep', 'new']);
    expect(mockStorage.assign).toEqual([]);
    expect((mockStorage.quiz as Quiz[]).map((q) => q.title)).toEqual(['q']);
  });
});

describe('fetch 캐시 (sessionStorage)', () => {
  function stubNavigationType(type: string | undefined) {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue(
      (type ? [{ type }] : []) as unknown as PerformanceEntryList
    );
  }

  it('뒤로/앞으로 이동이고 2분이 안 지났으면 유효하다', () => {
    stubNavigationType('back_forward');
    setFetchCache('1');
    expect(isFetchCacheValid('1')).toBe(true);
    expect(isFetchCacheValid('2')).toBe(false);
  });

  it('2분이 지나면 만료된다', () => {
    stubNavigationType('back_forward');
    sessionStorage.setItem('dotbugi_fetch_1', String(Date.now() - 2 * 60 * 1000 - 1));
    expect(isFetchCacheValid('1')).toBe(false);
  });

  it('일반 이동(새로 고침 등)에서는 캐시를 쓰지 않는다', () => {
    stubNavigationType('reload');
    setFetchCache('1');
    expect(isFetchCacheValid('1')).toBe(false);
    stubNavigationType(undefined);
    expect(isFetchCacheValid('1')).toBe(false);
  });
});

describe('세션 강좌 데이터', () => {
  it('저장한 데이터를 그대로 다시 읽는다', () => {
    saveSessionCourseData('1', [vod('1', 'v')], [assign('1', 'a')], []);
    expect(loadSessionCourseData('1')).toEqual({ vods: [vod('1', 'v')], assigns: [assign('1', 'a')], quizzes: [] });
  });

  it('없거나 깨진 값이면 null', () => {
    expect(loadSessionCourseData('1')).toBeNull();
    sessionStorage.setItem('dotbugi_data_1', '{broken');
    expect(loadSessionCourseData('1')).toBeNull();
  });
});
