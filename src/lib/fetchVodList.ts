import { fetchHtml, getText, getHref } from './fetchHtml';

function parseWeekNumber(section: Element): number {
  const match = section.id?.match(/section-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseVodTitle(activity: Element): string | null {
  const nameEl = activity.querySelector('.instancename');
  if (!nameEl) return null;
  const clone = nameEl.cloneNode(true) as Element;
  clone.querySelector('.accesshide')?.remove();
  return clone.textContent?.trim() || null;
}

export const fetchVodList = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const sections = doc.querySelectorAll('li[id^="section-"]');

    return Array.from(sections).flatMap((section) => {
      const week = parseWeekNumber(section);
      const subject = getText(section, '.sectionname') || `${week}`;
      const vodActivities = section.querySelectorAll('li.modtype_vod:not(.dimmed) .activityinstance');

      return Array.from(vodActivities)
        .map((activity) => {
          const title = parseVodTitle(activity);
          const url = getHref(activity, 'a');
          const range = getText(activity, '.text-ubstrap');
          const length = getText(activity, '.text-info')?.replace(',', '') ?? '';

          if (!title || !url || !range) return null;
          return { week, subject, title, url, range, length };
        })
        .filter((item) => item !== null);
    });
  } catch (error) {
    console.error('[Dotbugi] VOD 목록 조회 오류:', error);
    throw error;
  }
};
