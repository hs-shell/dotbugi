import { createZip, type ZipFile } from './zip';

const OLD_STORAGE_KEY = 'dotbugi_logs';
const STORAGE_PREFIX = 'dotbugi_logs_';
const MAX_LOGS_PER_CATEGORY = 200;

type LogLevel = 'info' | 'warn' | 'error';
type LogCategory = 'player' | 'course' | 'calendar' | 'storage' | 'general';

const LOG_CATEGORIES: LogCategory[] = ['player', 'course', 'calendar', 'storage', 'general'];

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

function formatEntry(level: LogLevel, args: unknown[]): LogEntry {
  const message = args
    .map((a) => {
      if (a instanceof Error) return `${a.message}${a.cause ? ` (cause: ${a.cause})` : ''}`;
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      }
      return String(a);
    })
    .join(' ');

  return {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
}

async function persist(category: LogCategory, entry: LogEntry) {
  try {
    const key = STORAGE_PREFIX + category;
    const result = await chrome.storage.local.get(key);
    const logs: LogEntry[] = result[key] ?? [];
    logs.push(entry);
    if (logs.length > MAX_LOGS_PER_CATEGORY) logs.splice(0, logs.length - MAX_LOGS_PER_CATEGORY);
    await chrome.storage.local.set({ [key]: logs });
  } catch {
    // storage 접근 불가 시 무시 (e.g. 테스트 환경)
  }
}

function log(category: LogCategory, level: LogLevel, ...args: unknown[]) {
  const entry = formatEntry(level, args);
  persist(category, entry);
}

interface CategoryLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

function createCategoryLogger(category: LogCategory): CategoryLogger {
  return {
    info: (...args: unknown[]) => log(category, 'info', ...args),
    warn: (...args: unknown[]) => log(category, 'warn', ...args),
    error: (...args: unknown[]) => log(category, 'error', ...args),
  };
}

export const logger: CategoryLogger & Record<LogCategory, CategoryLogger> = {
  // 기본 (general) — 기존 호출과 호환
  ...createCategoryLogger('general'),
  // 카테고리별
  player: createCategoryLogger('player'),
  course: createCategoryLogger('course'),
  calendar: createCategoryLogger('calendar'),
  storage: createCategoryLogger('storage'),
  general: createCategoryLogger('general'),
};

// 기존 단일 키 → 카테고리별 마이그레이션 (1회성)
(async () => {
  try {
    const result = await chrome.storage.local.get(OLD_STORAGE_KEY);
    const oldLogs: LogEntry[] | undefined = result[OLD_STORAGE_KEY];
    if (!oldLogs || oldLogs.length === 0) return;
    const key = STORAGE_PREFIX + 'general';
    await chrome.storage.local.set({ [key]: oldLogs.slice(-MAX_LOGS_PER_CATEGORY) });
    await chrome.storage.local.remove(OLD_STORAGE_KEY);
  } catch {
    // 무시
  }
})();

export async function getLogs(): Promise<Record<LogCategory, LogEntry[]>> {
  try {
    const keys = LOG_CATEGORIES.map((c) => STORAGE_PREFIX + c);
    const result = await chrome.storage.local.get(keys);
    const logs = {} as Record<LogCategory, LogEntry[]>;
    for (const category of LOG_CATEGORIES) {
      logs[category] = result[STORAGE_PREFIX + category] ?? [];
    }
    return logs;
  } catch {
    const empty = {} as Record<LogCategory, LogEntry[]>;
    for (const category of LOG_CATEGORIES) empty[category] = [];
    return empty;
  }
}

export async function clearLogs(): Promise<void> {
  const keys = LOG_CATEGORIES.map((c) => STORAGE_PREFIX + c);
  await chrome.storage.local.remove(keys);
}

/** 디버깅용 스토리지 스냅샷 (민감 정보 없음, 트래킹 강의만 포함) */
const STORAGE_DUMP_KEYS = [
  'vod', 'assign', 'quiz',
  'trackedCourseIds', 'communityIds', 'knownCourseIds',
  'courses', 'language', 'hiddenTaskUrls',
] as const;

async function getStorageDump(): Promise<string> {
  try {
    const result = await chrome.storage.local.get([...STORAGE_DUMP_KEYS]);
    const trackedIds = new Set<string>(result.trackedCourseIds ?? []);

    // 트래킹 중인 강의 데이터만 포함
    const filterByCourse = <T extends { courseId: string }>(items: T[]) =>
      items.filter((item) => trackedIds.has(item.courseId));

    if (Array.isArray(result.vod)) result.vod = filterByCourse(result.vod);
    if (Array.isArray(result.assign)) result.assign = filterByCourse(result.assign);
    if (Array.isArray(result.quiz)) result.quiz = filterByCourse(result.quiz);

    return JSON.stringify(result, null, 2);
  } catch {
    return '(스토리지 접근 불가)';
  }
}

export async function downloadLogs(): Promise<void> {
  const [allLogs, storageDump] = await Promise.all([getLogs(), getStorageDump()]);

  const encoder = new TextEncoder();
  const files: ZipFile[] = [];

  for (const category of LOG_CATEGORIES) {
    const logs = allLogs[category];
    if (logs.length === 0) continue;
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    files.push({ name: `${category}.txt`, data: encoder.encode(text) });
  }

  if (storageDump !== '(스토리지 접근 불가)') {
    files.push({ name: 'storage-snapshot.json', data: encoder.encode(storageDump) });
  }

  if (files.length === 0) return;

  const blob = createZip(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dotbugi-logs-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
