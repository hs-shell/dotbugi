import { toSameHostUrl } from './validate';

/** 암호화된 영상은 받지 않는다 (DRM·보호 우회로 보일 수 있는 동작을 하지 않기 위함) */
export class EncryptedHlsError extends Error {}

export type Playlist = { kind: 'media'; segments: URL[]; durationSec: number } | { kind: 'master'; variant: URL };

const KEY_TAG = /^#EXT-X-(?:SESSION-)?KEY:/;
const METHOD_ATTR = /(?:^|[:,])METHOD=([^,]+)/;
const BANDWIDTH_ATTR = /(?:^|[:,])BANDWIDTH=(\d+)/;
const STREAM_INF_TAG = '#EXT-X-STREAM-INF:';
const EXTINF_TAG = /^#EXTINF:([\d.]+)/;
/** TS 하나를 이어 붙여 변환하는 구조라 타임라인 끊김·별도 init·부분 범위 세그먼트는 지원하지 않는다 */
const UNSUPPORTED_TAGS = ['#EXT-X-DISCONTINUITY', '#EXT-X-MAP', '#EXT-X-BYTERANGE'];

/** m3u8 를 읽어 세그먼트 목록(미디어) 또는 고를 변형 주소(마스터)를 돌려준다 */
export function parsePlaylist(text: string, base: URL): Playlist {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  if (lines[0] !== '#EXTM3U') throw new Error('m3u8 형식이 아님');

  const uris: { uri: string; bandwidth: number | null }[] = [];
  let pendingBandwidth: number | null = null;
  let durationSec = 0;
  for (const line of lines) {
    if (!line) continue;
    const unsupported = UNSUPPORTED_TAGS.find((tag) => line === tag || line.startsWith(`${tag}:`));
    if (unsupported) throw new Error(`지원하지 않는 HLS 태그: ${unsupported}`);
    if (KEY_TAG.test(line)) {
      const method = METHOD_ATTR.exec(line)?.[1];
      if (method !== 'NONE') throw new EncryptedHlsError('암호화된 HLS');
    } else if (line.startsWith(STREAM_INF_TAG)) {
      pendingBandwidth = Number(BANDWIDTH_ATTR.exec(line)?.[1] ?? 0);
    } else if (EXTINF_TAG.test(line)) {
      durationSec += Number(EXTINF_TAG.exec(line)?.[1]);
    } else if (!line.startsWith('#')) {
      uris.push({ uri: line, bandwidth: pendingBandwidth });
      pendingBandwidth = null;
    }
  }

  const variants = uris.filter((u) => u.bandwidth !== null);
  if (variants.length > 0) {
    // 다른 호스트 변형은 버리고 같은 호스트 중 가장 높은 화질을 고른다
    const best = variants
      .map((v) => ({ url: toSameHostUrl(v.uri, base), bandwidth: v.bandwidth ?? 0 }))
      .filter((v): v is { url: URL; bandwidth: number } => v.url !== null)
      .sort((a, b) => b.bandwidth - a.bandwidth)[0];
    if (!best) throw new Error('같은 호스트의 변형 재생 목록 없음');
    return { kind: 'master', variant: best.url };
  }

  const segments = uris.map((u) => toSameHostUrl(u.uri, base));
  // 세그먼트 하나라도 다른 호스트면 일부만 받은 영상이 되므로 통째로 거부한다
  if (segments.length === 0 || segments.some((s) => s === null)) throw new Error('허용되지 않은 세그먼트 주소');
  return { kind: 'media', segments: segments as URL[], durationSec };
}
