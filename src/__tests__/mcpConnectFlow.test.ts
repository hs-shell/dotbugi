import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CALLBACK_TIMEOUT_MS,
  CONNECT_MESSAGE_TYPE,
  CONNECT_PAGE_PATH,
  getPendingStorageKey,
  PENDING_TAB_STORAGE_KEY,
} from '@/lib/mcpConnect/constants';
import { registerConnectListener } from '@/lib/mcpConnect/registerConnectListener';
import { relayConnectRequest } from '@/lib/mcpConnect/relayConnectRequest';
import { sendSessionToMcp } from '@/lib/mcpConnect/sendSessionToMcp';
import { takePendingRequest } from '@/lib/mcpConnect/takePendingRequest';

const CODE = 'abcDEF123_-xyz7890';
const SESSION = 'a1b2c3d4e5f6g7h8i9j0k1l2';
const REQUEST_ID = '12345678-1234-1234-1234-123456789abc';
const REQUEST = { port: 4321, code: CODE, session: SESSION };

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('sendSessionToMcp', () => {
  it('콜백 주소로 코드·세션을 POST 하고 리다이렉트를 막는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendSessionToMcp(REQUEST)).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:4321/cb');
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('error');
    expect(JSON.parse(init.body)).toEqual({ code: CODE, session: SESSION });
    expect(CALLBACK_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('실패 응답은 상태 코드로, 네트워크 오류는 network 로 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(sendSessionToMcp(REQUEST)).resolves.toEqual({ ok: false, status: 403 });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('refused')));
    await expect(sendSessionToMcp(REQUEST)).resolves.toEqual({ ok: false, reason: 'network' });
  });
});

describe('takePendingRequest', () => {
  const session: Record<string, unknown> = {};

  beforeEach(() => {
    Object.keys(session).forEach((k) => delete session[k]);
    vi.stubGlobal('chrome', {
      storage: {
        session: {
          get: vi.fn(async (key: string) => (key in session ? { [key]: session[key] } : {})),
          remove: vi.fn(async (key: string) => {
            delete session[key];
          }),
        },
      },
    });
  });

  it('이 창의 요청을 꺼내고 저장소에서 바로 지운다', async () => {
    session[getPendingStorageKey(REQUEST_ID)] = REQUEST;
    await expect(takePendingRequest(REQUEST_ID)).resolves.toEqual(REQUEST);
    expect(session).toEqual({});
    await expect(takePendingRequest(REQUEST_ID)).resolves.toBeNull();
  });

  it('요청 식별자 형식이 틀리면 저장소를 읽지 않는다', async () => {
    await expect(takePendingRequest(null)).resolves.toBeNull();
    await expect(takePendingRequest('../other')).resolves.toBeNull();
    expect(chrome.storage.session.get).not.toHaveBeenCalled();
  });

  it('저장된 값의 형식이 틀리면 null 이지만 값은 지운다', async () => {
    session[getPendingStorageKey(REQUEST_ID)] = { ...REQUEST, session: 'short' };
    await expect(takePendingRequest(REQUEST_ID)).resolves.toBeNull();
    expect(session).toEqual({});
  });
});

describe('registerConnectListener', () => {
  type Listener = (message: unknown, sender: { url?: string }) => void;
  let listener: Listener;
  const session: Record<string, unknown> = {};
  const createWindow = vi.fn();

  beforeEach(() => {
    Object.keys(session).forEach((k) => delete session[k]);
    createWindow.mockReset().mockResolvedValue({});
    vi.stubGlobal('crypto', { randomUUID: () => REQUEST_ID });
    vi.stubGlobal('chrome', {
      runtime: {
        onMessage: { addListener: (fn: Listener) => (listener = fn) },
        getURL: (path: string) => `chrome-extension://ext/${path}`,
      },
      storage: {
        session: {
          set: vi.fn(async (items: Record<string, unknown>) => Object.assign(session, items)),
          remove: vi.fn(async (key: string) => {
            delete session[key];
          }),
        },
      },
      windows: { create: createWindow },
    });
    registerConnectListener();
  });

  const message = { type: CONNECT_MESSAGE_TYPE, ...REQUEST };
  const lmsSender = { url: 'https://learn.hansung.ac.kr/my/' };

  it('LMS 의 올바른 요청을 저장하고 요청 식별자를 담은 확인 창을 연다', async () => {
    listener(message, lmsSender);
    await flush();

    expect(session[getPendingStorageKey(REQUEST_ID)]).toEqual(REQUEST);
    expect(createWindow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'popup', url: `chrome-extension://ext/${CONNECT_PAGE_PATH}?id=${REQUEST_ID}` })
    );
  });

  it('LMS 가 아닌 출처나 형식이 틀린 메시지는 무시한다', async () => {
    listener(message, { url: 'https://learn.hansung.ac.kr.evil.com/' });
    listener({ ...message, port: 80 }, lmsSender);
    await flush();
    expect(session).toEqual({});
    expect(createWindow).not.toHaveBeenCalled();
  });

  it('확인 창을 못 열면 저장한 세션을 지운다', async () => {
    createWindow.mockRejectedValue(new Error('no window'));
    listener(message, lmsSender);
    await flush();
    await flush();
    expect(session).toEqual({});
  });
});

describe('relayConnectRequest', () => {
  const sendMessage = vi.fn();

  function setLocation(path: string) {
    history.replaceState(null, '', path);
  }

  beforeEach(() => {
    sessionStorage.clear();
    sendMessage.mockReset().mockResolvedValue(undefined);
    vi.stubGlobal('chrome', { runtime: { sendMessage } });
    document.cookie = `MoodleSession=${SESSION}`;
  });

  afterEach(() => {
    document.cookie = 'MoodleSession=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setLocation('/');
  });

  it('해시의 연결 요청을 주소창에서 지우고, 로그인된 페이지면 세션과 함께 background 로 넘긴다', () => {
    setLocation(`/my/?a=1#dotbugi-connect=4321.${CODE}`);
    relayConnectRequest();

    expect(location.hash).toBe('');
    expect(location.search).toBe('?a=1');
    expect(sendMessage).toHaveBeenCalledWith({ type: CONNECT_MESSAGE_TYPE, port: 4321, code: CODE, session: SESSION });
    expect(sessionStorage.getItem(PENDING_TAB_STORAGE_KEY)).toBeNull();
  });

  it('로그인 페이지에서는 요청을 보관만 하고, 로그인 후 페이지에서 이어서 넘긴다', () => {
    setLocation(`/login/index.php#dotbugi-connect=4321.${CODE}`);
    relayConnectRequest();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PENDING_TAB_STORAGE_KEY)).not.toBeNull();

    setLocation('/my/');
    relayConnectRequest();
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it('세션 쿠키가 없으면 보관한 요청을 남겨 두고 보내지 않는다', () => {
    document.cookie = 'MoodleSession=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setLocation(`/my/#dotbugi-connect=4321.${CODE}`);
    relayConnectRequest();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PENDING_TAB_STORAGE_KEY)).not.toBeNull();
  });

  it('만료된 보관 요청은 지우기만 하고 보내지 않는다', () => {
    sessionStorage.setItem(PENDING_TAB_STORAGE_KEY, JSON.stringify({ port: 4321, code: CODE, exp: Date.now() - 1 }));
    setLocation('/my/');
    relayConnectRequest();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PENDING_TAB_STORAGE_KEY)).toBeNull();
  });

  it('sessionStorage 가 예외를 던져도 밖으로 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    setLocation('/my/');
    expect(() => relayConnectRequest()).not.toThrow();
  });
});
