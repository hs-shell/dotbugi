import { LMS_ORIGIN } from '@/lib/lmsUrl';
import { toCmid } from '@/lib/vodDownload/extractM3u8';
import { toVodFileName } from '@/lib/vodDownload/fileName';
import { createDownloadButton, DOWNLOAD_HOST_ATTR } from './downloadButton';

const VOD_ACTIVITY_SELECTOR = 'li.modtype_vod .activityinstance';
// 이름에서 뺄 것: 화면낭독기용 유형 문구와 돋부기가 붙인 배지·표시
const NON_TITLE_SELECTOR = `.accesshide, [data-dotbugi-status], [data-dotbugi-current-week], [data-dotbugi-weekly-debug], [${DOWNLOAD_HOST_ATTR}]`;

function cleanText(el: Element | null | undefined): string {
  if (!el) return '';
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll(NON_TITLE_SELECTOR).forEach((child) => child.remove());
  return clone.textContent?.trim() ?? '';
}

/**
 * 강의 페이지의 VOD 활동마다(dimmed 포함) 다운로드 버튼을 링크 바로 뒤(배지 다음)에 붙인다.
 * 링크 밖에 두어 클릭이 강의 열기로 이어지지 않고, 배지 재주입(배지만 지움)에도 남는다. 다시 불러도 중복되지 않는다.
 */
export function injectDownloadButtons(courseTitle: string): void {
  document.querySelectorAll(VOD_ACTIVITY_SELECTOR).forEach((activity) => {
    // 열람 기간이 지난(dimmed) 강의는 링크가 없다 — li 의 module-<cmid> 로 주소를 만들고 강의명 뒤에 붙인다
    const link = activity.querySelector('a');
    const vodUrl =
      link?.href ?? `${LMS_ORIGIN}/mod/vod/view.php?id=${activity.closest('li[id^="module-"]')?.id.slice(7)}`;
    const anchor = link ?? activity.querySelector('.instancename')?.parentElement;
    const cmid = toCmid(vodUrl);
    if (!anchor || !cmid || document.querySelector(`[${DOWNLOAD_HOST_ATTR}="${cmid}"]`)) return;

    const week = cleanText(activity.closest('li[id^="section-"]')?.querySelector('.sectionname'));
    const title = cleanText(activity.querySelector('.instancename'));
    anchor.after(createDownloadButton(vodUrl, cmid, toVodFileName([courseTitle, week, title])));
  });
}
