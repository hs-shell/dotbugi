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

/** chrome.storage.session 키 — 확인 창이 읽어 갈 대기 요청 */
export const PENDING_SESSION_STORAGE_KEY = 'mcpConnectPending';

/** 확인 창(확장 페이지) 경로 — vite.config.ts 의 build input 과 같은 경로 */
export const CONNECT_PAGE_PATH = 'src/connect/index.html';
export const CONNECT_WINDOW_WIDTH = 440;
export const CONNECT_WINDOW_HEIGHT = 360;

/** 선택 호스트 권한 (manifest optional_host_permissions 와 동일) */
export const LOCAL_HOST_PERMISSION = 'http://127.0.0.1/*';

/** dotbugi-mcp 콜백 주소 */
export const getCallbackUrl = (port: number) => `http://127.0.0.1:${port}/cb`;
