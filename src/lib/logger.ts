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

export async function downloadLogs(): Promise<void> {
  const logs = await getLogs();
  if (logs.length === 0) return;

  const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dotbugi-logs-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
