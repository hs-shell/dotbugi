export const fetchAssign = async (link: string) => {
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

    const headerMap: Record<string, string> = {};
    const headers = Array.from(doc.querySelectorAll('table.generaltable thead tr th'));
    headers.forEach((header) => {
      const text = header.textContent?.trim();
      const className = header.className.match(/c\d+/)?.[0];
      if (text && className) {
        if (text.includes('주제')) headerMap['subject'] = '.cell.' + className;
        else if (text.includes('과제')) {
          headerMap['title'] = '.cell.' + className;
          headerMap['url'] = headerMap['title'] + ' a';
        } else if (text.includes('종료 일시')) headerMap['dueDate'] = '.cell.' + className;
        else if (text.includes('제출')) headerMap['isSubmit'] = '.cell.' + className;
      }
    });

    let subject: string;
    const rows = Array.from(doc.querySelectorAll('table.generaltable tbody tr'));
    const assignments = rows
      .map((row) => {
        const title =
          row.querySelector(headerMap.title)?.textContent?.trim() ||
          row.querySelector(headerMap.assign)?.textContent?.trim() ||
          null;
        let sbj = row.querySelector(headerMap.subject)?.textContent?.trim() || '';
        const url = (row.querySelector(headerMap.url) as HTMLAnchorElement)?.href || null;
        const dueDate = row.querySelector(headerMap.dueDate)?.textContent?.trim() || null;
        const isSubmit = row.querySelector(headerMap.isSubmit)?.textContent?.trim() === '미제출' ? false : true;

        if (sbj.length !== 0) subject = sbj;
        if (!title || !url || !dueDate) return null;
        return { subject, title, url, dueDate, isSubmit };
      })
      .filter((assign) => assign !== null);

    return assignments;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
