import { fetchHtml } from '@/lib/fetchHtml';
import { extractM3u8Url, toViewerUrl } from './extractM3u8';
import { parsePlaylist } from './playlist';
import { createTsToMp4 } from './transmux';
import { toAllowedHlsUrl } from './validate';

const SEGMENT_RETRIES = 2;

/** CDN 요청: LMS 쿠키를 보내지 않고, 검증한 호스트를 벗어나는 리다이렉트는 따르지 않는다 */
async function fetchCdn(url: URL, signal: AbortSignal): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { credentials: 'omit', redirect: 'error', signal });
      // 경로의 토큰이 시간 제한 값이라 오류 메시지에 URL 을 넣지 않는다
      if (!res.ok) throw new Error(`CDN HTTP ${res.status}`);
      return res;
    } catch (error) {
      // 1시간 강의는 세그먼트가 수백 개라 일시적인 네트워크 오류 한 번에 전체가 실패하지 않게 재시도한다
      if (signal.aborted || attempt >= SEGMENT_RETRIES) throw error;
    }
  }
}

async function loadSegments(playlistUrl: URL, signal: AbortSignal): Promise<URL[]> {
  const playlist = parsePlaylist(await (await fetchCdn(playlistUrl, signal)).text(), playlistUrl);
  if (playlist.kind === 'media') return playlist.segments;
  const variant = parsePlaylist(await (await fetchCdn(playlist.variant, signal)).text(), playlist.variant);
  if (variant.kind !== 'media') throw new Error('중첩된 마스터 재생 목록');
  return variant.segments;
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
    const m3u8 = extractM3u8Url(await fetchHtml(viewerUrl));
    const playlistUrl = m3u8 ? toAllowedHlsUrl(m3u8) : null;
    if (!playlistUrl) throw new Error('허용된 영상 주소를 찾지 못함');

    const segments = await loadSegments(playlistUrl, signal);
    const toMp4 = createTsToMp4();
    let written = false;
    for (const [index, segment] of segments.entries()) {
      const ts = new Uint8Array(await (await fetchCdn(segment, signal)).arrayBuffer());
      for (const chunk of toMp4(ts)) {
        await writable.write(chunk);
        written = true;
      }
      onProgress((index + 1) / segments.length);
    }
    if (!written) throw new Error('MP4 로 변환된 데이터 없음');
    signal.throwIfAborted();
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    // remove() 는 Chrome 전용이라 없으면 건너뛴다
    await (handle as FileSystemFileHandle & { remove?: () => Promise<void> }).remove?.().catch(() => {});
    throw error;
  }
}
