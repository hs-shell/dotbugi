import { getAssignmentLink, getQuizLink, getVodLink } from '@/constants/constant';

const fetchVodData = (link: string) => {
  fetch(link, {
    method: 'GET',
    credentials: 'include',
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const today = new Date();
      const weekly = Array.from(
        doc.querySelectorAll('#yui_3_17_2_1_1737553569497_30 > div.total_sections > div > ul > li')
      ).map((week) => {});
    })
    .catch((error) => console.error('Fetch error:', error));
};

const fetchAssignData = (link: string) => {
  fetch(link, {
    method: 'GET',
    credentials: 'include',
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const headerMap: Record<string, string> = {};
      const headers = Array.from(doc.querySelectorAll('table.generaltable thead tr th'));
      headers.forEach((header) => {
        const text = header.textContent?.trim();
        const className = header.className.match(/c\d+/)?.[0];
        if (text && className) {
          // TODO 다양한 언어 설정에 맞춰서 수정
          if (text.includes('주제')) headerMap['subject'] = '.cell.' + className;
          else if (text.includes('과제')) {
            headerMap['title'] = '.cell.' + className;
            headerMap['link'] = headerMap['title'] + ' a';
          } else if (text.includes('종료 일시')) headerMap['dueDate'] = '.cell.' + className;
          else if (text.includes('제출')) headerMap['isDone'] = '.cell.' + className;
        }
      });

      console.log(headerMap);
      const rows = Array.from(doc.querySelectorAll('table.generaltable tbody tr'));
      const assignments = rows
        .map((row) => {
          const title =
            row.querySelector(headerMap.title)?.textContent?.trim() ||
            row.querySelector(headerMap.assign)?.textContent?.trim() ||
            null;

          const link = (row.querySelector(headerMap.link) as HTMLAnchorElement)?.href || null;
          const dueDate = row.querySelector(headerMap.dueDate)?.textContent?.trim() || null;
          // 언어 설정 필요
          const isDone = row.querySelector(headerMap.isDone)?.textContent?.trim() === '미제출' ? false : true;

          if (title && dueDate) {
            return { title, link, dueDate, isDone };
          }
          return null;
        })
        .filter((assignment) => assignment !== null);
      console.log(assignments);
    })
    .catch((error) => console.error('Fetch error:', error));
};

const fetchQuizData = (link: string) => {
  fetch(link, {
    method: 'GET',
    credentials: 'include',
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const headerMap: Record<string, string> = {};
      const headers = Array.from(doc.querySelectorAll('table.generaltable thead tr th'));
      headers.forEach((header) => {
        const text = header.textContent?.trim();
        const className = header.className.match(/c\d+/)?.[0];
        if (text && className) {
          // TODO 다양한 언어 설정에 맞춰서 수정
          if (text.includes('주제')) headerMap['subject'] = '.cell.' + className;
          else if (text.includes('제목')) {
            headerMap['title'] = '.cell.' + className;
            headerMap['link'] = headerMap['title'] + ' a';
          } else if (text.includes('종료 일시')) headerMap['dueDate'] = '.cell.' + className;
        }
      });

      const rows = Array.from(doc.querySelectorAll('table.generaltable tbody tr'));
      const assignments = rows
        .map((row) => {
          const title = row.querySelector(headerMap.title)?.textContent?.trim() || null;
          const link = (row.querySelector(headerMap.link) as HTMLAnchorElement)?.href || null;
          const dueDate = row.querySelector(headerMap.dueDate)?.textContent?.trim() || null;

          if (title && dueDate) {
            return { title, link, dueDate };
          }
          return null;
        })
        .filter((assignment) => assignment !== null);
      console.log(assignments);
    })
    .catch((error) => console.error('Fetch error:', error));
};

export const requestData = (id: string) => {
  const VOD_LINK = getVodLink(id);
  const ASSIGN_LINK = getAssignmentLink(id);
  const QUIZ_LINK = getQuizLink(id);

  const vodData = fetchVodData(VOD_LINK);
  const assignData = fetchAssignData(ASSIGN_LINK);
  const quizData = fetchQuizData(QUIZ_LINK);
};
