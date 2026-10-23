import {
  CONNECT_PAGE_PATH,
  CONNECT_WINDOW_HEIGHT,
  CONNECT_WINDOW_WIDTH,
  getPendingStorageKey,
  REQUEST_ID_PARAM,
} from './constants';
import { isLmsSender, parseConnectMessage } from './validate';

/**
 * (background) LMS content script 의 연결 요청을 받아 확장 전용 확인 창을 연다.
 * 확인 창은 확장 출처라 웹페이지가 흉내 낼 수 없다.
 * 주의: sender.url 에는 일회용 코드가, 메시지에는 세션이 들어 있으므로 절대 로그에 남기지 않는다.
 */
export function registerConnectListener(): void {
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!isLmsSender(sender.url)) return;
    const request = parseConnectMessage(message);
    if (!request) return;

    // storage.session 은 기본적으로 확장 페이지·서비스 워커만 접근 가능(content script 불가)
    const requestId = crypto.randomUUID();
    const storageKey = getPendingStorageKey(requestId);
    chrome.storage.session
      .set({ [storageKey]: request })
      .then(() =>
        chrome.windows.create({
          type: 'popup',
          url: chrome.runtime.getURL(`${CONNECT_PAGE_PATH}?${REQUEST_ID_PARAM}=${requestId}`),
          width: CONNECT_WINDOW_WIDTH,
          height: CONNECT_WINDOW_HEIGHT,
        })
      )
      // 확인 창을 못 열면 세션이 저장소에 남지 않도록 즉시 지운다
      .catch(() => chrome.storage.session.remove(storageKey));
  });
}
