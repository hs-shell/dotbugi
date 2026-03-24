const STORAGE_KEY = 'dotbugi_logs';
const MAX_LOGS = 500;

type LogLevel = 'info' | 'warn' | 'error';

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

async function persist(entry: LogEntry) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const logs: LogEntry[] = result[STORAGE_KEY] ?? [];
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    await chrome.storage.local.set({ [STORAGE_KEY]: logs });
  } catch {
    // storage 접근 불가 시 무시 (e.g. 테스트 환경)
  }
}

function log(level: LogLevel, ...args: unknown[]) {
  const entry = formatEntry(level, args);
  persist(entry);
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};

export async function getLogs(): Promise<LogEntry[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] ?? [];
  } catch {
    return [];
  }
}

export async function clearLogs(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
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
  const [logs, storageDump] = await Promise.all([getLogs(), getStorageDump()]);
  if (logs.length === 0 && storageDump === '(스토리지 접근 불가)') return;

  const logText = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
  const text = [logText, '', '=== Storage Snapshot ===', storageDump].join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dotbugi-logs-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
