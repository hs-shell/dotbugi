import { CONNECT_MESSAGE_TYPE, PENDING_SESSION_STORAGE_KEY } from './constants';
import { parseConnectMessage, type ConnectRequest } from './validate';

/** (확인 창) 대기 중인 연결 요청을 꺼내고 저장소에서 즉시 지운다 — 세션이 남지 않도록 1회용 */
export async function takePendingRequest(): Promise<ConnectRequest | null> {
  const result = await chrome.storage.session.get<Record<string, unknown>>(PENDING_SESSION_STORAGE_KEY);
  await chrome.storage.session.remove(PENDING_SESSION_STORAGE_KEY);
  const stored = result[PENDING_SESSION_STORAGE_KEY];
  if (typeof stored !== 'object' || stored === null) return null;
  return parseConnectMessage({ ...stored, type: CONNECT_MESSAGE_TYPE });
}
