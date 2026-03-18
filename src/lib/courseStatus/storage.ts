import { Vod, Assign, Quiz } from '@/types';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';

const TEMP_COURSES_KEY = 'tempCourseFetchTimes';
const TEMP_COURSE_TTL_MS = 60 * 1000;
const FETCH_CACHE_TTL_MS = 2 * 60 * 1000;

type TempCourseFetchTimes = Record<string, number>;

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

// ── Temp course cleanup ─────────────────────────────────────────────

export async function cleanupExpiredTempCourses() {
  const times = (await load<TempCourseFetchTimes>(TEMP_COURSES_KEY)) ?? {};
  const now = Date.now();
  const expired = Object.entries(times)
    .filter(([, at]) => now - at >= TEMP_COURSE_TTL_MS)
    .map(([id]) => id);

  if (expired.length === 0) return;

  const expiredSet = new Set(expired);
  const all = await loadAllData();

  const notExpired = <T extends { courseId: string }>(items: T[]) =>
    items.filter((item) => !expiredSet.has(item.courseId));

  saveDataToStorage('vod', notExpired(all.vods));
  saveDataToStorage('assign', notExpired(all.assigns));
  saveDataToStorage('quiz', notExpired(all.quizzes));

  for (const id of expired) delete times[id];
  saveDataToStorage(TEMP_COURSES_KEY, times);
}

export async function registerTempCourse(courseId: string) {
  const times = (await load<TempCourseFetchTimes>(TEMP_COURSES_KEY)) ?? {};
  times[courseId] = Date.now();
  saveDataToStorage(TEMP_COURSES_KEY, times);
}

// ── Fetch cache (sessionStorage) ────────────────────────────────────

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
