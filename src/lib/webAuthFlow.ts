// Google Chrome 이 아닌 Chromium 브라우저(Dia·웨일·Edge 등)용 Google OAuth.
// 이들에서 getAuthToken 은 커스텀 URI 스킴 리다이렉트를 쓰는데 Google 이 더는 지원하지 않아
// 새 로그인이 400 invalid_request 로 막힌다(#196). 대신 웹 애플리케이션 client 로 launchWebAuthFlow 를 쓴다.

// 웹 애플리케이션 유형 client. 리디렉션 URI 에 정식·베타 확장의 https://<ID>.chromiumapp.org/ 가 등록돼 있다
export const WEB_CLIENT_ID = '804067218183-19qe8qsr37q988i48tru6nro57enouio.apps.googleusercontent.com';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const CACHE_KEY = 'webAuthToken';
// 만료 직전 토큰으로 API 를 부르다 401 이 나지 않게 여유를 둔다
const EXPIRY_MARGIN_MS = 60_000;

interface CachedToken {
  token: string;
  expiresAt: number;
}

// 브랜드 정보를 못 읽으면 기존 Chrome 경로(getAuthToken)로 둔다 — 잘 되던 Chrome 로그인을 바꾸지 않게
export function isGoogleChrome(): boolean {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return !brands?.length || brands.some((b) => b.brand === 'Google Chrome');
}

export function buildAuthUrl(redirectUri: string, state: string, interactive: boolean): string {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set('client_id', WEB_CLIENT_ID);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', SCOPE);
  url.searchParams.set('state', state);
  // 비대화형은 화면 없이 끝나야 한다 — 동의·로그인이 필요하면 오류로 돌아온다
  if (!interactive) url.searchParams.set('prompt', 'none');
  return url.toString();
}

// 리다이렉트 주소의 해시(#access_token=...)에서 토큰을 꺼낸다. state 가 다르거나 오류면 null
export function parseRedirect(responseUrl: string, state: string, now = Date.now()): CachedToken | null {
  const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));
  const token = params.get('access_token');
  const expiresIn = Number(params.get('expires_in'));
  if (params.get('state') !== state || !token || !Number.isFinite(expiresIn) || expiresIn <= 0) return null;
  return { token, expiresAt: now + expiresIn * 1000 };
}

export async function getWebAuthToken(interactive: boolean): Promise<string> {
  const cached = (await chrome.storage.session.get(CACHE_KEY))[CACHE_KEY] as CachedToken | undefined;
  if (cached && cached.expiresAt - EXPIRY_MARGIN_MS > Date.now()) return cached.token;

  const state = crypto.randomUUID();
  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: buildAuthUrl(chrome.identity.getRedirectURL(), state, interactive),
    interactive,
  });
  const result = responseUrl ? parseRedirect(responseUrl, state) : null;
  if (!result) throw new Error('Google 로그인 응답에 토큰이 없습니다.');
  await chrome.storage.session.set({ [CACHE_KEY]: result });
  return result.token;
}

// 토큰이 비었으면(로그아웃·초기화) 무조건 지운다
export async function clearWebAuthToken(token: string): Promise<void> {
  const cached = (await chrome.storage.session.get(CACHE_KEY))[CACHE_KEY] as CachedToken | undefined;
  if (!token || cached?.token === token) await chrome.storage.session.remove(CACHE_KEY);
}
