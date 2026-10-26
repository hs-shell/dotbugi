import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useVodDownload } from '@/hooks/useVodDownload';
import { runVodDownload, type VodDownloadResult } from '@/lib/vodDownload/controller';
import type { Vod } from '@/types';
import { renderHook } from './renderHook';

// useSyncExternalStore 스냅샷은 같은 참조여야 하므로 상수로 둔다
const { ACTIVE, SAVED } = vi.hoisted(() => ({
  ACTIVE: { vodUrl: 'https://learn.hansung.ac.kr/mod/vod/view.php?id=7', percent: 42 },
  SAVED: new Set(['7']),
}));

vi.mock('@/lib/vodDownload/controller', () => ({
  cancelVodDownload: vi.fn(),
  getActiveVodDownload: () => ACTIVE,
  getSavedCmids: () => SAVED,
  runVodDownload: vi.fn(),
  subscribeVodDownload: () => () => {},
}));

const VOD = {
  courseTitle: '자료구조',
  subject: '1주차',
  title: '강의/1',
  url: 'https://learn.hansung.ac.kr/mod/vod/view.php?id=7',
} as Vod;

beforeEach(() => {
  vi.clearAllMocks();
});

async function startWith(result: VodDownloadResult, notify = vi.fn()) {
  vi.mocked(runVodDownload).mockImplementation(async (_url, _name, onProgress) => {
    onProgress?.(0);
    onProgress?.(0.5);
    return result;
  });
  const hook = await renderHook(useVodDownload, notify);
  await act(async () => hook.result.current.start(VOD));
  return { notify, hook };
}

describe('useVodDownload', () => {
  it('진행 중인 다운로드 상태를 그대로 보여 준다', async () => {
    const { result } = await renderHook(useVodDownload, vi.fn());
    expect(result.current.activeUrl).toBe(VOD.url);
    expect(result.current.percent).toBe(42);
    expect(result.current.isSaved(VOD)).toBe(true);
    expect(result.current.isSaved({ ...VOD, url: 'x' })).toBe(false);
  });

  it('과목-주차-강의명으로 파일 이름을 만들고, 시작과 완료를 한 번씩 알린다', async () => {
    const { notify } = await startWith('done');
    expect(vi.mocked(runVodDownload).mock.calls[0][1]).toBe('자료구조-1주차-강의_1.mp4');
    expect(notify.mock.calls.map(([n]) => [n.type, n.messageKey])).toEqual([
      ['loading', 'vodDownload.started'],
      ['success', 'vodDownload.done'],
    ]);
  });

  it.each([
    ['cancelled', 'warning'],
    ['busy', 'warning'],
    ['failed', 'error'],
    ['encrypted', 'error'],
  ] as const)('결과가 %s 이면 %s 로 알린다', async (outcome, type) => {
    const { notify } = await startWith(outcome);
    expect(notify).toHaveBeenLastCalledWith({ type, messageKey: `vodDownload.${outcome}`, autoDismiss: true });
  });

  it('저장 대화상자를 닫으면(dismissed) 결과를 알리지 않는다', async () => {
    const { notify } = await startWith('dismissed');
    expect(notify.mock.calls.map(([n]) => n.messageKey)).toEqual(['vodDownload.started']);
  });
});
