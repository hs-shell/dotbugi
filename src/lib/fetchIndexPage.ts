export const fetchIndexPage = async (link: string) => {
  try {
    const response = await fetch(link, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const weeks = Array.from(doc.querySelectorAll('#region-main > div > div > div.total_sections > div > ul > li'));

    const vods = weeks
      .map((week, index) => {
        const subject = week.querySelector('.content .sectionname')?.textContent?.trim() || index + '주차';
        const contents = Array.from(week.querySelectorAll('.content .vod .activityinstance'));
        const vodsWeekly = contents
          .filter((item) => !item.closest('.dimmed'))
          .map((item) => {
            const week = index + 1;
            const instancename = item.querySelector('.instancename');
            instancename?.querySelector('.accesshide')?.remove();
            const title = instancename?.textContent?.trim() || null;
            const url = item.querySelector('a')?.getAttribute('href') || null;
            const range = item.querySelector('.text-ubstrap')?.textContent?.trim() || '';
            const length = item.querySelector('.text-info')?.textContent?.replace(',', '').trim() || '';

            if (!title || !url) return null;
            return { week, subject, title, url, range, length };
          })
          .filter((item) => item !== null);

        if (!vodsWeekly || vodsWeekly.length === 0) return null;
        return vodsWeekly;
      })
      .filter((week) => week !== null)
      .flat();

    return vods;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
