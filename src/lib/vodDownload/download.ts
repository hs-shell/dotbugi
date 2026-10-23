import { fetchHtml } from '@/lib/fetchHtml';
import { extractM3u8Url, toViewerUrl } from './extractM3u8';
import { patchInitDuration } from './patchDuration';
import { parsePlaylist } from './playlist';
import { toAllowedHlsUrl } from './validate';

const CDN_RETRIES = 2;
const CDN_RETRY_DELAY_MS = 1500;
const HTTP_SERVER_ERROR = 500;

class RetryableError extends Error {}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** CDN 요청: LMS 쿠키를 보내지 않고, 검증한 호스트를 벗어나는 리다이렉트는 따르지 않는다 */
async function fetchCdn(url: URL, signal: AbortSignal): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      let res: Response;
      try {
        res = await fetch(url, { credentials: 'omit', redirect: 'error', signal });
      } catch (error) {
        throw signal.aborted ? error : new RetryableError('CDN 네트워크 오류', { cause: error });
      }
      // 경로의 토큰이 시간 제한 값이라 오류 메시지에 URL 을 넣지 않는다
      if (res.status >= HTTP_SERVER_ERROR) throw new RetryableError(`CDN HTTP ${res.status}`);
      // 4xx(토큰 만료 403 등)는 다시 해도 같으므로 바로 실패
      if (!res.ok) throw new Error(`CDN HTTP ${res.status}`);
      return res;
    } catch (error) {
      // 1시간 강의는 세그먼트가 수백 개라 일시적인 오류 한 번에 전체가 실패하지 않게 잠시 뒤 재시도한다
      if (!(error instanceof RetryableError) || attempt >= CDN_RETRIES) throw error;
      await wait(CDN_RETRY_DELAY_MS);
      signal.throwIfAborted();
    }
  }
}

async function loadMediaPlaylist(playlistUrl: URL, signal: AbortSignal) {
  const playlist = parsePlaylist(await (await fetchCdn(playlistUrl, signal)).text(), playlistUrl);
  if (playlist.kind === 'media') return playlist;
  const variant = parsePlaylist(await (await fetchCdn(playlist.variant, signal)).text(), playlist.variant);
  if (variant.kind !== 'media') throw new Error('중첩된 마스터 재생 목록');
  return variant;
}

/**
 * VOD 를 MP4 로 받아 파일에 바로 쓴다 (1시간 ≈ 600MB 라 메모리에 모으지 않는다).
 * 실패·취소 시 쓰기를 버리고 선택 시 만들어진 빈 파일도 지워 부분 파일을 남기지 않는다.
 */
export async function downloadVod(
  vodUrl: string,
  handle: FileSystemFileHandle,
  signal: AbortSignal,
  onProgress: (ratio: number) => void
): Promise<void> {
  const writable = await handle.createWritable();
  try {
    const viewerUrl = toViewerUrl(vodUrl);
    if (!viewerUrl) throw new Error('VOD 주소에서 id 를 찾지 못함');
    const m3u8 = extractM3u8Url(await fetchHtml(viewerUrl, signal));
    const playlistUrl = m3u8 ? toAllowedHlsUrl(m3u8) : null;
    if (!playlistUrl) throw new Error('허용된 영상 주소를 찾지 못함');

    const { segments, durationSec } = await loadMediaPlaylist(playlistUrl, signal);
    // mux.js 는 모든 LMS 페이지에 싣기엔 커서 실제로 받을 때만 불러온다
    const toMp4 = (await import('./transmux')).createTsToMp4();
    let init: Uint8Array | null = null;
    for (const [index, segment] of segments.entries()) {
      const ts = new Uint8Array(await (await fetchCdn(segment, signal)).arrayBuffer());
      for (const chunk of toMp4(ts)) {
        init ??= chunk; // 첫 출력의 첫 조각이 init 세그먼트(파일 맨 앞)
        await writable.write(chunk);
      }
      onProgress((index + 1) / segments.length);
    }
    if (!init) throw new Error('MP4 로 변환된 데이터 없음');
    signal.throwIfAborted();
    // 길이가 같은 바이트로 덮어쓰므로 파일 맨 앞 init 세그먼트만 바뀐다
    if (durationSec > 0) {
      await writable.write({ type: 'write', position: 0, data: patchInitDuration(init, durationSec) });
    }
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    // remove() 는 Chrome 전용이라 없으면 건너뛴다
    await (handle as FileSystemFileHandle & { remove?: () => Promise<void> }).remove?.().catch(() => {});
    throw error;
  }
}
