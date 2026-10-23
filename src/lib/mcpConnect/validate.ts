import {
  CONNECT_CODE_PATTERN,
  CONNECT_HASH_PATTERN,
  CONNECT_MESSAGE_TYPE,
  MAX_CALLBACK_PORT,
  MIN_CALLBACK_PORT,
  SESSION_COOKIE_NAME,
  SESSION_VALUE_PATTERN,
} from './constants';
import { isLmsUrl } from '@/lib/lmsUrl';

/** CLI가 넘겨준 연결 대상 */
export interface ConnectTarget {
  port: number;
  code: string;
}

/** dotbugi-mcp 로 보낼 연결 요청 */
export interface ConnectRequest extends ConnectTarget {
  session: string;
}

export function isValidPort(port: unknown): port is number {
  return Number.isInteger(port) && (port as number) >= MIN_CALLBACK_PORT && (port as number) <= MAX_CALLBACK_PORT;
}

export function isValidCode(code: unknown): code is string {
  return typeof code === 'string' && CONNECT_CODE_PATTERN.test(code);
}

export function isValidSession(session: unknown): session is string {
  return typeof session === 'string' && SESSION_VALUE_PATTERN.test(session);
}

/** location.hash 에서 연결 대상을 꺼낸다. 형식이 틀리면 null */
export function parseConnectHash(hash: string): ConnectTarget | null {
  const match = hash.match(CONNECT_HASH_PATTERN);
  if (!match) return null;
  const port = Number(match[1]);
  return isValidPort(port) ? { port, code: match[2] } : null;
}

/** 탭 sessionStorage 에 보관한 값 → 만료 전이고 형식이 맞으면 연결 대상 */
export function parsePendingTarget(raw: string | null, now: number): ConnectTarget | null {
  if (!raw) return null;
  try {
    // 같은 출처의 페이지 스크립트도 sessionStorage 를 쓸 수 있으므로 형식을 다시 확인한다
    const { port, code, exp } = JSON.parse(raw) as { port?: unknown; code?: unknown; exp?: unknown };
    if (typeof exp !== 'number' || exp <= now || !isValidPort(port) || !isValidCode(code)) return null;
    return { port, code };
  } catch {
    return null;
  }
}

/** document.cookie 문자열에서 LMS 세션 값을 읽는다 */
export function readSessionCookie(cookie: string): string | null {
  for (const part of cookie.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE_NAME) return rest.join('=') || null;
  }
  return null;
}

/** 메시지를 보낸 문서가 LMS 출처인지 (startsWith 대신 origin 비교로 유사 도메인 차단) */
export function isLmsSender(url: string | undefined): boolean {
  return isLmsUrl(url);
}

/** content script 메시지 → 연결 요청. 신뢰 경계이므로 모든 필드를 다시 검증한다 */
export function parseConnectMessage(message: unknown): ConnectRequest | null {
  if (typeof message !== 'object' || message === null) return null;
  const { type, port, code, session } = message as Record<string, unknown>;
  if (type !== CONNECT_MESSAGE_TYPE || !isValidPort(port) || !isValidCode(code) || !isValidSession(session)) {
    return null;
  }
  return { port, code, session };
}
