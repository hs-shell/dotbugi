import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadAutoRefresh, saveAutoRefresh } from '@/lib/autoRefreshSetting';

const mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        set: vi.fn((items: Record<string, unknown>) => Object.assign(mockStorage, items)),
        get: vi.fn((keys: string[], cb: (result: Record<string, unknown>) => void) =>
          cb(Object.fromEntries(keys.filter((k) => k in mockStorage).map((k) => [k, mockStorage[k]])))
        ),
      },
    },
  });
});

describe('자동 새로고침 설정', () => {
  it('저장값이 없으면 켜짐', async () => {
    expect(await loadAutoRefresh()).toBe(true);
  });

  it('끈 값(false)을 그대로 읽는다', async () => {
    saveAutoRefresh(false);
    expect(await loadAutoRefresh()).toBe(false);
    saveAutoRefresh(true);
    expect(await loadAutoRefresh()).toBe(true);
  });

  it('읽기에 실패하면(lastError) 멈추지 않고 기본값(켜짐)으로 끝난다', async () => {
    vi.stubGlobal('chrome', {
      runtime: { lastError: { message: 'storage read failed' } },
      storage: { local: { get: vi.fn((_keys: string[], cb: (result?: unknown) => void) => cb(undefined)) } },
    });
    expect(await loadAutoRefresh()).toBe(true);
  });
});
