/** 실측한 VOD CDN 호스트 형식 — 이 밖의 주소로는 요청하지 않는다 */
const HLS_HOST_PATTERN = /^[a-z0-9-]+\.edge\.naverncp\.com$/;

/** https + 허용 CDN 호스트일 때만 URL 을 돌려준다 (상대 주소는 base 기준으로 해석) */
export function toAllowedHlsUrl(ref: string, base?: URL): URL | null {
  let url: URL;
  try {
    url = new URL(ref, base);
  } catch {
    return null;
  }
  // 사용자 정보·임의 포트가 붙은 주소는 호스트 검사를 우회하는 데 쓰일 수 있어 거른다
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
  return HLS_HOST_PATTERN.test(url.hostname) ? url : null;
}

/** 재생 목록이 가리키는 주소는 재생 목록과 같은 호스트일 때만 허용한다 */
export function toSameHostUrl(ref: string, base: URL): URL | null {
  const url = toAllowedHlsUrl(ref, base);
  return url && url.host === base.host ? url : null;
}
