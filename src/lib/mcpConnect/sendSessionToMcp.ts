import { getCallbackUrl } from './constants';
import type { ConnectRequest } from './validate';

export type SendResult = { ok: true } | { ok: false; reason: 'network' } | { ok: false; status: number };

/**
 * (확인 창) 이 PC의 dotbugi-mcp 로 세션을 전달한다.
 * 127.0.0.1 접근은 manifest 의 host_permissions(http://*\/*)로 이미 허용되어 있다.
 */
export async function sendSessionToMcp({ port, code, session }: ConnectRequest): Promise<SendResult> {
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
