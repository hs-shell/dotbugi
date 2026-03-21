const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * LMS 페이지를 fetch하고 DOM으로 파싱하여 반환
 * 네트워크 에러(Failed to fetch) 시 최대 2회 재시도
 */
export async function fetchHtml(link: string): Promise<Document> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(link, {
        method: 'GET',
        credentials: 'include',
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
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

/** 셀렉터로 요소의 텍스트 추출. 없으면 null */
export function getText(parent: Element, selector: string): string | null {
  return parent.querySelector(selector)?.textContent?.trim() || null;
}

/** 셀렉터로 a 태그의 href 추출. 없으면 null */
export function getHref(parent: Element, selector: string): string | null {
  return parent.querySelector<HTMLAnchorElement>(selector)?.href || null;
}
