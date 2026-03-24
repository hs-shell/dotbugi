import { Vod, Assign, Quiz } from '@/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';

const FETCH_CACHE_TTL_MS = 2 * 60 * 1000;

// ── Generic loader ──────────────────────────────────────────────────

export function load<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => loadDataFromStorage<T>(key, resolve));
}

// ── Course data ─────────────────────────────────────────────────────

export async function loadCourseData(courseId: string) {
  const [vods, assigns, quizzes, hidden] = await Promise.all([
    load<Vod[]>('vod'),
    load<Assign[]>('assign'),
    load<Quiz[]>('quiz'),
    load<string[]>('hiddenTaskUrls'),
  ]);

  const byCourse = <T extends { courseId: string }>(items: T[] | null) =>
    (items ?? []).filter((item) => item.courseId === courseId);

  return {
    vods: byCourse(vods),
    assigns: byCourse(assigns),
    quizzes: byCourse(quizzes),
    hiddenUrls: new Set(hidden ?? []),
  };
}

export async function loadAllData() {
  const [vods, assigns, quizzes] = await Promise.all([
    load<Vod[]>('vod'),
    load<Assign[]>('assign'),
    load<Quiz[]>('quiz'),
  ]);
  return { vods: vods ?? [], assigns: assigns ?? [], quizzes: quizzes ?? [] };
}

export function saveCourseData(
  courseId: string,
  newVods: Vod[],
  newAssigns: Assign[],
  newQuizzes: Quiz[],
  all: { vods: Vod[]; assigns: Assign[]; quizzes: Quiz[] },
) {
  const exclude = <T extends { courseId: string }>(items: T[]) =>
    items.filter((item) => item.courseId !== courseId);

  saveDataToStorage('vod', [...exclude(all.vods), ...newVods]);
  saveDataToStorage('assign', [...exclude(all.assigns), ...newAssigns]);
  saveDataToStorage('quiz', [...exclude(all.quizzes), ...newQuizzes]);
}

// ── Session cache (sessionStorage) ──────────────────────────────────

function isBackForwardNavigation(): boolean {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  return entry?.type === 'back_forward';
}

export function isFetchCacheValid(courseId: string): boolean {
  if (!isBackForwardNavigation()) return false;
  const raw = sessionStorage.getItem(`dotbugi_fetch_${courseId}`);
  return !!raw && Date.now() - parseInt(raw, 10) < FETCH_CACHE_TTL_MS;
}

export function setFetchCache(courseId: string) {
  sessionStorage.setItem(`dotbugi_fetch_${courseId}`, Date.now().toString());
}

/** 비트래킹 강좌용: sessionStorage에 데이터 캐시 (탭 닫으면 소멸) */
export function saveSessionCourseData(courseId: string, vods: Vod[], assigns: Assign[], quizzes: Quiz[]) {
  sessionStorage.setItem(`dotbugi_data_${courseId}`, JSON.stringify({ vods, assigns, quizzes }));
}

export function loadSessionCourseData(courseId: string): { vods: Vod[]; assigns: Assign[]; quizzes: Quiz[] } | null {
  const raw = sessionStorage.getItem(`dotbugi_data_${courseId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
