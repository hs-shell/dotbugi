import { CONNECT_MESSAGE_TYPE, getPendingStorageKey, REQUEST_ID_PATTERN } from './constants';
import { parseConnectMessage, type ConnectRequest } from './validate';

/** (확인 창) 이 창의 연결 요청만 꺼내고 저장소에서 즉시 지운다 — 세션이 남지 않도록 1회용 */
export async function takePendingRequest(requestId: string | null): Promise<ConnectRequest | null> {
  if (!requestId || !REQUEST_ID_PATTERN.test(requestId)) return null;
  const key = getPendingStorageKey(requestId);
  const result = await chrome.storage.session.get<Record<string, unknown>>(key);
  await chrome.storage.session.remove(key);
  const stored = result[key];
  if (typeof stored !== 'object' || stored === null) return null;
  return parseConnectMessage({ ...stored, type: CONNECT_MESSAGE_TYPE });
}
