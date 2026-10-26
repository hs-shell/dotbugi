import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useHiddenTasks } from '@/hooks/useHiddenTasks';
import { renderHook, stubChromeStorage } from './renderHook';

const store: Record<string, unknown> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal('chrome', stubChromeStorage(store).chromeStub);
});

describe('useHiddenTasks', () => {
  it('저장된 숨김 목록을 불러온다', async () => {
    store.hiddenTaskUrls = ['a'];
    const { result } = await renderHook(useHiddenTasks, undefined);
    expect(result.current.isHidden('a')).toBe(true);
    expect(result.current.isHidden('b')).toBe(false);
  });

  it('숨기기·여러 개 숨기기·되돌리기가 상태와 저장소에 함께 반영된다', async () => {
    const { result } = await renderHook(useHiddenTasks, undefined);

    await act(async () => result.current.hideTask('a'));
    await act(async () => result.current.hideTasks(['b', 'c', 'a']));
    expect([...result.current.hiddenUrls]).toEqual(['a', 'b', 'c']);
    expect(store.hiddenTaskUrls).toEqual(['a', 'b', 'c']);

    await act(async () => result.current.unhideTask('b'));
    expect(result.current.isHidden('b')).toBe(false);
    expect(store.hiddenTaskUrls).toEqual(['a', 'c']);
  });
});
