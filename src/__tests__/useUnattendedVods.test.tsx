import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUnattendedVods } from '@/popover/player/hooks/useUnattendedVods';
import { renderHook, stubChromeStorage } from './renderHook';

const store: Record<string, unknown> = {};
let emitChange: ReturnType<typeof stubChromeStorage>['emitChange'];

const LMS = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=';
const NOW_RANGE = '2026-03-01 00:00:00 ~ 2026-03-31 23:59:00';
const vod = (id: string, over: Record<string, unknown> = {}) => ({
  title: id,
  url: `${LMS}${id}`,
  range: NOW_RANGE,
  isAttendance: 'X',
  ...over,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 2, 15));
  Object.keys(store).forEach((k) => delete store[k]);
  const stub = stubChromeStorage(store);
  emitChange = stub.emitChange;
  vi.stubGlobal('chrome', stub.chromeStub);
});

afterEach(() => {
  vi.useRealTimers();
});

const titles = (vods: { title: string }[]) => vods.map((v) => v.title);

describe('useUnattendedVods', () => {
  it('기간 안의 미출석·숨기지 않은·LMS 출처 영상만 목록에 올린다', async () => {
    store.vod = [
      vod('ok'),
      vod('attended', { isAttendance: 'O' }),
      vod('expired', { range: '2026-01-01 00:00:00 ~ 2026-01-31 23:59:00' }),
      vod('hidden'),
      vod('external', { url: 'https://evil.example.com/v' }),
    ];
    store.hiddenTaskUrls = [`${LMS}hidden`];

    const { result } = await renderHook(useUnattendedVods, false);
    expect(titles(result.current.vods)).toEqual(['ok']);
  });

  it('재생 중이 아닐 때 VOD·숨김 목록이 바뀌면 다시 불러오고, 재생 중이면 목록을 유지한다', async () => {
    store.vod = [vod('a')];
    const { result, rerender } = await renderHook(useUnattendedVods, false);

    store.vod = [vod('a'), vod('b')];
    await emitChange({ vod: { newValue: store.vod } });
    expect(titles(result.current.vods)).toEqual(['a', 'b']);

    await rerender(true);
    store.vod = [vod('c')];
    await emitChange({ vod: { newValue: store.vod } });
    expect(titles(result.current.vods)).toEqual(['a', 'b']);

    await act(async () => result.current.loadUnattendedVods());
    expect(titles(result.current.vods)).toEqual(['c']);
  });

  it('저장된 VOD 가 없으면 빈 목록', async () => {
    const { result } = await renderHook(useUnattendedVods, false);
    expect(result.current.vods).toEqual([]);
  });
});
