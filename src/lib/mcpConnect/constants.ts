/**
 * dotbugi-mcp 연결(localhost 콜백) 관련 상수 — 형식·키·경로의 단일 출처.
 * CLI(dotbugi-mcp login) 쪽 계약과 맞춰야 하므로 값을 바꿀 때는 양쪽을 함께 바꾼다.
 */

/** CLI가 여는 URL의 해시: #dotbugi-connect=<포트>.<일회용 코드> */
export const CONNECT_HASH_PATTERN = /^#dotbugi-connect=(\d{4,5})\.([A-Za-z0-9_-]{16,64})$/;

/** 일회용 코드 형식 (CLI가 생성) */
export const CONNECT_CODE_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

/** MoodleSession 값 형식 — CLI도 같은 정규식으로 검증한다 */
export const SESSION_VALUE_PATTERN = /^[A-Za-z0-9,-]{20,128}$/;

/** 로컬 콜백 포트 허용 범위 (well-known 포트 제외) */
export const MIN_CALLBACK_PORT = 1024;
export const MAX_CALLBACK_PORT = 65535;

/** LMS 세션 쿠키 이름 (HttpOnly가 아니라 document.cookie로 읽힌다) */
export const SESSION_COOKIE_NAME = 'MoodleSession';

/** 경로에 이 문자열이 있으면 로그인 페이지로 보고 세션 전달을 미룬다 */
export const LOGIN_PATH_KEYWORD = 'login';

/** 탭 sessionStorage 키 — 로그인 리다이렉트를 거쳐도 연결 요청을 이어가기 위해 보관 */
export const PENDING_TAB_STORAGE_KEY = 'dotbugiConnect';

/** 연결 요청 유효 시간 */
export const CONNECT_TTL_MS = 5 * 60_000;

/** content script → background 메시지 타입 */
export const CONNECT_MESSAGE_TYPE = 'dotbugiMcpConnect';

/** chrome.storage.session 키 — 확인 창이 읽어 갈 대기 요청. 창마다 요청 식별자로 분리해 서로 덮어쓰지 않는다 */
const PENDING_SESSION_STORAGE_PREFIX = 'mcpConnectPending:';
export const getPendingStorageKey = (requestId: string) => `${PENDING_SESSION_STORAGE_PREFIX}${requestId}`;

/** 확인 창 URL 의 요청 식별자 쿼리 이름과 형식 (crypto.randomUUID) */
export const REQUEST_ID_PARAM = 'id';
export const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** dotbugi-mcp 콜백 응답 대기 한도 — 넘으면 실패로 보고 창을 다시 쓸 수 있게 한다 */
export const CALLBACK_TIMEOUT_MS = 10_000;

/** 확인 창(확장 페이지) 경로 — vite.config.ts 의 build input 과 같은 경로 */
export const CONNECT_PAGE_PATH = 'src/connect/index.html';
export const CONNECT_WINDOW_WIDTH = 440;
export const CONNECT_WINDOW_HEIGHT = 360;

/** 확인 코드(지문) 길이 — CLI 가 터미널에 같은 값을 보여 준다 */
export const FINGERPRINT_LENGTH = 6;

/** dotbugi-mcp 콜백 주소 */
export const getCallbackUrl = (port: number) => `http://127.0.0.1:${port}/cb`;

/** 연결 성공 후 확인 창을 자동으로 닫기까지의 시간 (결과를 읽을 여유) */
export const CONNECT_WINDOW_AUTO_CLOSE_MS = 5000;
