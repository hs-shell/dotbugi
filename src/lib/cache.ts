export const REFRESH_INTERVAL_MS = 60 * 1000;
export const CACHE_TTL_MINUTES = 1440; // 24시간
export const CACHE_TTL_MS = CACHE_TTL_MINUTES * REFRESH_INTERVAL_MS;

const CACHE_KEY = 'lastRequestTime';

export function getLastRequestTime(): number | null {
  const raw = localStorage.getItem(CACHE_KEY);
  return raw ? parseInt(raw, 10) : null;
}

export function setLastRequestTime(time: number): void {
  localStorage.setItem(CACHE_KEY, time.toString());
}

export function clearLastRequestTime(): void {
  localStorage.removeItem(CACHE_KEY);
}
