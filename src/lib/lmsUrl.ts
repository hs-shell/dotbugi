/** LMS 출처 — 세션 전달·링크 열기의 보안 경계라 외부 패키지 값이 아닌 이 저장소에 고정한다 */
export const LMS_ORIGIN = 'https://learn.hansung.ac.kr';

/** URL 이 LMS 출처인지 (startsWith 대신 origin 비교로 유사 도메인·`javascript:` 차단) */
export function isLmsUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    // 기준 URL 없이 파싱해 `//evil.com` 같은 상대 주소는 예외로 거른다
    return new URL(url).origin === LMS_ORIGIN;
  } catch {
    return false;
  }
}

/** 스크래핑한 URL 은 LMS 페이지의 외부 링크일 수 있어 LMS 출처일 때만 연다 */
export function openLmsUrl(url: string, target = '_blank', features?: string): void {
  if (isLmsUrl(url)) window.open(url, target, features);
}
