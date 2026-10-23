import { LMS_ORIGIN } from '@/lib/lmsUrl';

const VIEWER_PATH = '/mod/vod/viewer.php';
const CMID_PATTERN = /^\d+$/;
/** JW Player 설정 `sources: [{file: '<...>.m3u8'}]` 의 주소만 잡는다 (따옴표 짝·공백·꺾쇠 없는 https 주소) */
const M3U8_PATTERN = /sources\s*:\s*\[\s*\{\s*file\s*:\s*(['"])(https:\/\/[^'"\s<>\\]+?\.m3u8)\1/;

/** VOD 목록의 `view.php?id=<cmid>` 주소에서 영상 주소가 들어 있는 viewer 페이지 주소를 만든다 */
export function toViewerUrl(vodUrl: string): string | null {
  let cmid: string | null;
  try {
    cmid = new URL(vodUrl, LMS_ORIGIN).searchParams.get('id');
  } catch {
    return null;
  }
  return cmid && CMID_PATTERN.test(cmid) ? `${LMS_ORIGIN}${VIEWER_PATH}?id=${cmid}` : null;
}

/** viewer 페이지 스크립트에서 m3u8 주소를 꺼낸다 (호스트 검증은 호출부에서) */
export function extractM3u8Url(doc: Document): string | null {
  for (const script of Array.from(doc.scripts)) {
    const match = M3U8_PATTERN.exec(script.textContent ?? '');
    if (match) return match[2];
  }
  return null;
}
