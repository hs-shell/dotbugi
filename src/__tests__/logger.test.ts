import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const store: Record<string, unknown> = {};

function stubChrome() {
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (keys: string | string[]) =>
          Object.fromEntries(
            [keys]
              .flat()
              .filter((k) => k in store)
              .map((k) => [k, store[k]])
          )
        ),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: vi.fn(async (keys: string | string[]) => {
          [keys].flat().forEach((k) => delete store[k]);
        }),
      },
    },
  });
}

/** logger 는 import 시점에 마이그레이션을 돌리므로 매번 새로 불러온다 */
async function importLogger() {
  vi.resetModules();
  return import('@/lib/logger');
}

/** jsdom 의 Blob 에는 arrayBuffer() 가 없어 FileReader 로 읽는다 */
function readBlob(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  stubChrome();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('logger', () => {
  it('카테고리별 키에 레벨·메시지를 남기고, 객체·Error 는 읽을 수 있게 직렬화한다', async () => {
    const { logger, getLogs } = await importLogger();
    logger.player.warn('재생 실패', { id: 1 }, new Error('boom', { cause: 'net' }));
    await flush();
    logger.error('기본');
    await flush();

    const logs = await getLogs();
    expect(logs.player).toHaveLength(1);
    expect(logs.player[0].level).toBe('warn');
    expect(logs.player[0].message).toBe('재생 실패 {"id":1} boom (cause: net)');
    expect(logs.general.map((l) => l.message)).toEqual(['기본']);
    expect(logs.course).toEqual([]);
  });

  it('순환 참조 객체도 로그를 깨뜨리지 않는다', async () => {
    const { logger, getLogs } = await importLogger();
    const obj: Record<string, unknown> = {};
    obj.self = obj;
    logger.course.info(obj);
    await flush();
    expect((await getLogs()).course[0].message).toBe('[object Object]');
  });

  it('카테고리마다 최근 200개만 보관한다', async () => {
    store.dotbugi_logs_storage = Array.from({ length: 200 }, (_, i) => ({
      timestamp: '',
      level: 'info',
      message: `${i}`,
    }));
    const { logger, getLogs } = await importLogger();
    logger.storage.info('new');
    await flush();

    const logs = (await getLogs()).storage;
    expect(logs).toHaveLength(200);
    expect(logs[0].message).toBe('1');
    expect(logs.at(-1)!.message).toBe('new');
  });

  it('예전 단일 키 로그를 general 로 옮기고 예전 키를 지운다', async () => {
    store.dotbugi_logs = [{ timestamp: 't', level: 'info', message: 'old' }];
    const { getLogs } = await importLogger();
    await flush();

    expect('dotbugi_logs' in store).toBe(false);
    expect((await getLogs()).general.map((l) => l.message)).toEqual(['old']);
  });

  it('clearLogs 는 모든 카테고리 로그를 지운다', async () => {
    const { logger, getLogs, clearLogs } = await importLogger();
    logger.calendar.error('x');
    await flush();
    await clearLogs();
    expect(Object.values(await getLogs()).flat()).toEqual([]);
  });

  it('스토리지에 접근할 수 없으면 빈 로그를 돌려준다', async () => {
    vi.unstubAllGlobals();
    const { logger, getLogs } = await importLogger();
    logger.info('무시됨');
    const logs = await getLogs();
    expect(Object.keys(logs)).toEqual(['player', 'course', 'calendar', 'storage', 'general']);
    expect(Object.values(logs).flat()).toEqual([]);
  });
});

describe('downloadLogs', () => {
  function captureDownload() {
    const blobs: Blob[] = [];
    // 진짜 URL 을 고치지 않도록 하위 클래스로 바꿔 끼운다 (unstubAllGlobals 로 원래대로)
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = (b: Blob) => (blobs.push(b), 'blob:x');
        static revokeObjectURL = () => {};
      }
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    return { blobs, click };
  }

  it('로그와 추적 강좌만 남긴 스토리지 스냅샷을 ZIP 으로 내려받는다', async () => {
    store.trackedCourseIds = ['1'];
    store.vod = [
      { courseId: '1', title: 'tracked' },
      { courseId: '2', title: 'untracked' },
    ];
    const { logger, downloadLogs } = await importLogger();
    logger.course.info('hello');
    await flush();
    const { blobs, click } = captureDownload();

    await downloadLogs();

    expect(click).toHaveBeenCalledTimes(1);
    const text = new TextDecoder().decode(await readBlob(blobs[0]));
    expect(text).toContain('course.txt');
    expect(text).toContain('[INFO] hello');
    expect(text).toContain('storage-snapshot.json');
    expect(text).toContain('tracked');
    expect(text).not.toContain('untracked');
  });

  it('스토리지에 접근할 수 없어 담을 파일이 없으면 내려받지 않는다', async () => {
    vi.unstubAllGlobals();
    const { downloadLogs } = await importLogger();
    const { click } = captureDownload();
    await downloadLogs();
    expect(click).not.toHaveBeenCalled();
  });
});
