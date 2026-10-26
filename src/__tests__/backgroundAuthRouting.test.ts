import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// background 의 OAuth 메시지가 브라우저에 따라 올바른 경로로 가는지 (#196). 기존 Chrome 로그인이 바뀌면 안 된다
vi.mock('@/lib/mcpConnect/registerConnectListener', () => ({ registerConnectListener: () => {} }));

type Listener = (message: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean | undefined;
let onMessage: Listener;
let onInstalled: (details: { reason: string }) => void;
let onClicked: () => void;
const tabsCreate = vi.fn();
const local: Record<string, unknown> = {};

const getAuthToken = vi.fn((_opts: unknown, cb: (token?: string) => void) => cb('chrome-token'));
const removeCachedAuthToken = vi.fn((_opts: unknown, cb: () => void) => cb());
const launchWebAuthFlow = vi.fn(async ({ url }: { url: string }) => {
  const state = new URL(url).searchParams.get('state');
  return `https://abc.chromiumapp.org/#access_token=web-token&expires_in=3600&state=${state}`;
});
const session: Record<string, unknown> = {};

vi.stubGlobal('chrome', {
  runtime: {
    id: 'own-ext-id',
    onMessage: { addListener: (l: Listener) => (onMessage = l) },
    onInstalled: { addListener: (l: typeof onInstalled) => (onInstalled = l) },
  },
  action: { onClicked: { addListener: (l: typeof onClicked) => (onClicked = l) } },
  tabs: { create: tabsCreate },
  identity: {
    getAuthToken,
    removeCachedAuthToken,
    launchWebAuthFlow,
    getRedirectURL: () => 'https://abc.chromiumapp.org/',
  },
  storage: {
    local: {
      get: (key: string, cb: (r: Record<string, unknown>) => void) => cb(key in local ? { [key]: local[key] } : {}),
    },
    session: {
      get: async (key: string) => (key in session ? { [key]: session[key] } : {}),
      set: async (items: Record<string, unknown>) => Object.assign(session, items),
      remove: async (key: string) => void delete session[key],
    },
  },
});

const setBrands = (brands: string[]) =>
  Object.defineProperty(navigator, 'userAgentData', {
    value: { brands: brands.map((brand) => ({ brand })) },
    configurable: true,
  });

const getAuthTokenFails = () =>
  getAuthToken.mockImplementationOnce((_opts: unknown, cb: (token?: string) => void) => cb(undefined));

const send = (message: unknown) =>
  new Promise((resolve) => expect(onMessage(message, { id: 'own-ext-id' }, resolve)).toBe(true));

describe('background OAuth 경로', () => {
  beforeAll(async () => {
    await import('@/background');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(session)) delete session[key];
  });

  it('Google Chrome 은 기존 getAuthToken·removeCachedAuthToken 만 쓴다', async () => {
    setBrands(['Chromium', 'Google Chrome', 'Not-A.Brand']);

    expect(await send({ action: 'getAuthToken', interactive: true })).toEqual({ token: 'chrome-token' });
    expect(getAuthToken).toHaveBeenCalledWith({ interactive: true }, expect.any(Function));
    expect(await send({ action: 'getAuthToken' })).toEqual({ token: 'chrome-token' });
    expect(getAuthToken).toHaveBeenLastCalledWith({ interactive: true }, expect.any(Function));

    expect(await send({ action: 'removeCachedAuthToken', token: 'chrome-token' })).toEqual({ success: true });
    expect(removeCachedAuthToken).toHaveBeenCalledWith({ token: 'chrome-token' }, expect.any(Function));
    expect(launchWebAuthFlow).not.toHaveBeenCalled();
  });

  it('Chrome 이 아니면(Dia: Chromium·Not-A.Brand) 웹 로그인 흐름을 쓴다', async () => {
    setBrands(['Chromium', 'Not-A.Brand']);

    expect(await send({ action: 'getAuthToken', interactive: true })).toEqual({ token: 'web-token' });
    expect(launchWebAuthFlow).toHaveBeenCalledTimes(1);
    expect(await send({ action: 'removeCachedAuthToken', token: 'web-token' })).toEqual({ success: true });
    expect(session).toEqual({});
    expect(getAuthToken).not.toHaveBeenCalled();
    expect(removeCachedAuthToken).not.toHaveBeenCalled();
  });

  it('다른 확장·출처가 보낸 메시지는 무시한다', () => {
    setBrands(['Chromium', 'Google Chrome']);
    const sendResponse = vi.fn();

    expect(onMessage({ action: 'getAuthToken' }, { id: 'other-ext-id' }, sendResponse)).toBeUndefined();
    expect(onMessage({ action: 'getAuthToken' }, {}, sendResponse)).toBeUndefined();
    expect(getAuthToken).not.toHaveBeenCalled();
    expect(sendResponse).not.toHaveBeenCalled();
  });

  it('웹 흐름 실패는 기존과 같은 { token: null, error } 로 돌려준다', async () => {
    setBrands(['Chromium']);
    launchWebAuthFlow.mockRejectedValueOnce(new Error('The user did not approve access.'));

    expect(await send({ action: 'getAuthToken', interactive: true })).toEqual({
      token: null,
      error: 'The user did not approve access.',
    });
  });
});

describe('background 설치·아이콘 클릭', () => {
  beforeAll(async () => {
    await import('@/background');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(local)) delete local[key];
  });

  it('처음 설치할 때만 안내 문서를 연다', () => {
    onInstalled({ reason: 'update' });
    expect(tabsCreate).not.toHaveBeenCalled();
    onInstalled({ reason: 'install' });
    expect(tabsCreate).toHaveBeenCalledWith({ url: 'https://hs-shell.github.io/dotbugi/' });
  });

  it('아이콘을 누르면 설정한 언어의 문서를 열고, 한국어·미설정이면 기본 문서를 연다', () => {
    local.language = 'ja';
    onClicked();
    expect(tabsCreate).toHaveBeenLastCalledWith({ url: 'https://hs-shell.github.io/dotbugi/ja/' });

    local.language = 'ko';
    onClicked();
    expect(tabsCreate).toHaveBeenLastCalledWith({ url: 'https://hs-shell.github.io/dotbugi/' });
  });

  it('Chrome 에서 토큰을 못 받으면 { token: null } 로 돌려준다', async () => {
    setBrands(['Google Chrome']);
    getAuthTokenFails();
    expect(await send({ action: 'getAuthToken', interactive: false })).toEqual({ token: null, error: undefined });
  });
});
