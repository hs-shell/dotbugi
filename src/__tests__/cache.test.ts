import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLastRequestTime,
  setLastRequestTime,
  clearLastRequestTime,
  CACHE_TTL_MS,
  CACHE_TTL_MINUTES,
  REFRESH_INTERVAL_MS,
} from '@/lib/cache';

describe('cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기 상태에서 null 반환', () => {
    expect(getLastRequestTime()).toBeNull();
  });

  it('setLastRequestTime 후 getLastRequestTime 반환', () => {
    setLastRequestTime(1000);
    expect(getLastRequestTime()).toBe(1000);
  });

  it('clearLastRequestTime 후 null 반환', () => {
    setLastRequestTime(1000);
    clearLastRequestTime();
    expect(getLastRequestTime()).toBeNull();
  });

  it('큰 타임스탬프도 정확히 저장/반환', () => {
    const ts = Date.now();
    setLastRequestTime(ts);
    expect(getLastRequestTime()).toBe(ts);
  });

  it('덮어쓰기가 동작', () => {
    setLastRequestTime(100);
    setLastRequestTime(200);
    expect(getLastRequestTime()).toBe(200);
  });
});

describe('cache constants', () => {
  it('REFRESH_INTERVAL_MS = 60초', () => {
    expect(REFRESH_INTERVAL_MS).toBe(60_000);
  });

  it('CACHE_TTL_MINUTES = 60분', () => {
    expect(CACHE_TTL_MINUTES).toBe(60);
  });

  it('CACHE_TTL_MS = 60분 * 60초 * 1000', () => {
    expect(CACHE_TTL_MS).toBe(CACHE_TTL_MINUTES * REFRESH_INTERVAL_MS);
  });
});
