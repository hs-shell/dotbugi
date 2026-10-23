import { CONNECT_MESSAGE_TYPE, CONNECT_TTL_MS, LOGIN_PATH_KEYWORD, PENDING_TAB_STORAGE_KEY } from './constants';
import { parseConnectHash, parsePendingTarget, readSessionCookie } from './validate';

/**
 * (content script) dotbugi-mcp 연결 요청을 받아 로그인된 페이지에서 background 로 넘긴다.
 * 해시 → 탭 sessionStorage 보관 → 로그인 리다이렉트 후에도 이어서 처리.
 * LMS 페이지 출처의 localhost fetch 는 Chrome 로컬 네트워크 접근 제한으로 막히므로 실제 전송은 확장 페이지가 한다.
 */
export function relayConnectRequest(): void {
  // 사이트 데이터 차단 등으로 sessionStorage 가 예외를 던져도 팝오버 초기화는 계속되게 연결 기능만 중단한다
  try {
    relay();
  } catch {
    /* 연결 기능만 건너뛴다 */
  }
}

function relay(): void {
  const target = parseConnectHash(location.hash);
  if (target) {
    sessionStorage.setItem(PENDING_TAB_STORAGE_KEY, JSON.stringify({ ...target, exp: Date.now() + CONNECT_TTL_MS }));
    // 일회용 코드가 주소창·방문 기록에 남지 않게 해시를 지운다
    history.replaceState(history.state, '', location.pathname + location.search);
  }

  if (location.pathname.includes(LOGIN_PATH_KEYWORD)) return;

  const raw = sessionStorage.getItem(PENDING_TAB_STORAGE_KEY);
  if (!raw) return;
  const session = readSessionCookie(document.cookie);
  if (!session) return;

  sessionStorage.removeItem(PENDING_TAB_STORAGE_KEY);
  const pending = parsePendingTarget(raw, Date.now());
  if (!pending) return;
  chrome.runtime.sendMessage({ type: CONNECT_MESSAGE_TYPE, ...pending, session });
}
