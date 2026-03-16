import { fetchHtml, getText, getHref } from './fetchHtml';
import { normalizeLmsRange } from './lmsKeywords';

function parseWeekNumber(section: Element): number {
  const match = section.id?.match(/section-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseVodTitle(activity: Element): string | undefined {
  const nameEl = activity.querySelector('.instancename');
  if (!nameEl) return;
  const clone = nameEl.cloneNode(true) as Element;
  clone.querySelector('.accesshide')?.remove();
  return clone.textContent?.trim();
}

export const fetchVodList = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const sections = doc.querySelectorAll('li[id^="section-"]');

    return Array.from(sections).flatMap((section) => {
      const week = parseWeekNumber(section);
      const subject = getText(section, '.sectionname') || `${week}`;
      const vodActivities = section.querySelectorAll('li.modtype_vod:not(.dimmed) .activityinstance');

      return Array.from(vodActivities).flatMap((activity) => {
        const title = parseVodTitle(activity);
        const url = getHref(activity, 'a');
        const rawRange = getText(activity, '.text-ubstrap');
        if (!title || !url || !rawRange) return [];
        const range = normalizeLmsRange(rawRange)!;

        const length = getText(activity, '.text-info')?.replace(',', '') ?? '';
        return { week, subject, title, url, range, length };
      });
    });
  } catch (error) {
    console.error('[Dotbugi] VOD 목록 조회 오류:', error);
    throw error;
  }
};
