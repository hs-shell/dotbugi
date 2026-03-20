/**
 * LMS 페이지를 fetch하고 DOM으로 파싱하여 반환
 */
export async function fetchHtml(link: string): Promise<Document> {
  const response = await fetch(link, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${link}`);
  }

  const html = await response.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

/** 셀렉터로 요소의 텍스트 추출. 없으면 null */
export function getText(parent: Element, selector: string): string | null {
  return parent.querySelector(selector)?.textContent?.trim() || null;
}

/** 셀렉터로 a 태그의 href 추출. 없으면 null */
export function getHref(parent: Element, selector: string): string | null {
  return parent.querySelector<HTMLAnchorElement>(selector)?.href || null;
}
