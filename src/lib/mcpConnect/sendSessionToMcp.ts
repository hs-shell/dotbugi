import { getCallbackUrl, LOCAL_HOST_PERMISSION } from './constants';
import type { ConnectRequest } from './validate';

export type SendResult = { ok: true } | { ok: false; reason: 'permission' | 'network' } | { ok: false; status: number };

/**
 * (확인 창) 이 PC의 dotbugi-mcp 로 세션을 전달한다.
 * 반드시 사용자 클릭 핸들러 안에서 호출해야 한다 — permissions.request 는 사용자 제스처가 필요하다.
 */
export async function sendSessionToMcp({ port, code, session }: ConnectRequest): Promise<SendResult> {
  if (!(await chrome.permissions.request({ origins: [LOCAL_HOST_PERMISSION] }))) {
    return { ok: false, reason: 'permission' };
  }
  try {
    const res = await fetch(getCallbackUrl(port), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, session }),
    });
    return res.ok ? { ok: true } : { ok: false, status: res.status };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
