import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAuthUrl, clearWebAuthToken, getWebAuthToken, isGoogleChrome, parseRedirect } from '@/lib/webAuthFlow';

const REDIRECT = 'https://abc.chromiumapp.org/';

// chrome.storage.session 과 identity 를 메모리로 흉내 낸다
const store: Record<string, unknown> = {};
const launchWebAuthFlow = vi.fn();
vi.stubGlobal('chrome', {
  storage: {
    session: {
      get: async (key: string) => (key in store ? { [key]: store[key] } : {}),
      set: async (items: Record<string, unknown>) => Object.assign(store, items),
      remove: async (key: string) => void delete store[key],
    },
  },
  identity: { launchWebAuthFlow, getRedirectURL: () => REDIRECT },
});

// 인증 URL 의 state 를 그대로 돌려주는 정상 응답
const respondWith = (token: string, expiresIn = 3600) =>
  launchWebAuthFlow.mockImplementation(async ({ url }: { url: string }) => {
    const state = new URL(url).searchParams.get('state');
    return `${REDIRECT}#access_token=${token}&token_type=Bearer&expires_in=${expiresIn}&state=${state}`;
  });

describe('webAuthFlow', () => {
  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    launchWebAuthFlow.mockReset();
  });

  it('Google Chrome 브랜드가 있을 때만 Chrome 으로 본다', () => {
    const setBrands = (brands: string[]) =>
      Object.defineProperty(navigator, 'userAgentData', {
        value: { brands: brands.map((brand) => ({ brand })) },
        configurable: true,
      });
    setBrands(['Chromium', 'Google Chrome', 'Not-A.Brand']);
    expect(isGoogleChrome()).toBe(true);
    setBrands(['Chromium', 'Not-A.Brand']);
    expect(isGoogleChrome()).toBe(false);
  });

  it('비대화형 요청에만 prompt=none 을 붙인다', () => {
    const url = new URL(buildAuthUrl(REDIRECT, 's', false));
    expect(url.searchParams.get('response_type')).toBe('token');
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT);
    expect(url.searchParams.get('prompt')).toBe('none');
    expect(new URL(buildAuthUrl(REDIRECT, 's', true)).searchParams.has('prompt')).toBe(false);
  });

  it('state 가 다르거나 오류 응답이면 토큰을 받지 않는다', () => {
    expect(parseRedirect(`${REDIRECT}#access_token=t&expires_in=3600&state=s`, 's', 0)).toEqual({
      token: 't',
      expiresAt: 3_600_000,
    });
    expect(parseRedirect(`${REDIRECT}#access_token=t&expires_in=3600&state=x`, 's')).toBeNull();
    expect(parseRedirect(`${REDIRECT}#error=interaction_required&state=s`, 's')).toBeNull();
  });

  it('유효한 토큰은 캐시에서 돌려주고, 지우면 다시 받는다', async () => {
    respondWith('t1');
    expect(await getWebAuthToken(true)).toBe('t1');
    expect(await getWebAuthToken(false)).toBe('t1');
    expect(launchWebAuthFlow).toHaveBeenCalledTimes(1);

    await clearWebAuthToken('t1');
    respondWith('t2');
    expect(await getWebAuthToken(false)).toBe('t2');
    expect(launchWebAuthFlow).toHaveBeenLastCalledWith(expect.objectContaining({ interactive: false }));
  });

  it('곧 만료될 토큰은 쓰지 않고 새로 받는다', async () => {
    respondWith('old', 30);
    await getWebAuthToken(true);
    respondWith('new');
    expect(await getWebAuthToken(false)).toBe('new');
  });

  it('다른 토큰을 지우라는 요청은 캐시를 건드리지 않는다', async () => {
    respondWith('t1');
    await getWebAuthToken(true);
    await clearWebAuthToken('other');
    expect(await getWebAuthToken(false)).toBe('t1');
    expect(launchWebAuthFlow).toHaveBeenCalledTimes(1);
  });
});
