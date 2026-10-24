import { isLmsUrl, LMS_ORIGIN, urlOriginForLog } from '@/lib/lmsUrl';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * LMS 페이지를 fetch하고 DOM으로 파싱하여 반환
 * 네트워크 에러(Failed to fetch) 시 최대 2회 재시도
 */
export async function fetchHtml(link: string, signal?: AbortSignal): Promise<Document> {
  // 쿠키(credentials)를 실어 보내므로 스크래핑한 외부 링크로는 요청하지 않는다. 상대 주소는 LMS 기준으로 해석
  const url = new URL(link, LMS_ORIGIN).href;
  if (!isLmsUrl(url)) throw new Error(`LMS 출처가 아닌 주소 요청을 막음: ${urlOriginForLog(url)}`);
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${link}`);
      }

      const html = await response.text();
      return new DOMParser().parseFromString(html, 'text/html');
    } catch (error) {
      lastError = error;

      // HTTP 에러(서버가 응답은 했지만 4xx/5xx)는 재시도하지 않음
      if (error instanceof Error && error.message.startsWith('HTTP ')) {
        throw error;
      }

      // 네트워크 에러(Failed to fetch)만 재시도
      if (signal?.aborted) throw error;
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}
