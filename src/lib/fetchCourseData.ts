import { getAssignmentLink, getQuizLink, getVodLink } from '@/constants/constant';

const fetchVodData = async (link: string) => {
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

    const isAttendances = Array.from(
      doc.querySelectorAll('#region-main > div > div > div.user_attendance.course_box > div > ul > li')
    );

    const weeklyData = Array.from(
      doc.querySelectorAll('#region-main > div > div > div.total_sections > div > ul > li')
    ).map((week, index) => {
      const subject = week.querySelector('.content .sectionname')?.textContent?.trim() || index + '주차';
      const items = Array.from(week.querySelectorAll('.content .vod .activityinstance'))
        .filter((item) => !item.closest('.dimmed'))
        .map((item) => {
          const title = item.querySelector('.instancename')?.textContent?.replace('동영상', '').trim() || 'No Title';
          const url = item.querySelector('a')?.getAttribute('href') || 'No URL';
          const range = item.querySelector('.text-ubstrap')?.textContent?.trim() || 'No Range';
          const length = item.querySelector('.text-info')?.textContent?.replace(',', '').trim() || 'No Length';
          return { title, url, range, length };
        });

      const attendanceText = isAttendances[index]?.textContent?.trim();
      const isAttendance = attendanceText?.includes('출석') ? true : attendanceText?.includes('-') ? null : false;

      return { subject, items, isAttendance };
    });

    return weeklyData;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const fetchAssignData = async (link: string) => {
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
    const assignments = rows.map((row) => {
      const title =
        row.querySelector(headerMap.title)?.textContent?.trim() ||
        row.querySelector(headerMap.assign)?.textContent?.trim() ||
        'No Title';
      let sbj = row.querySelector(headerMap.subject)?.textContent?.trim() || '';
      const url = (row.querySelector(headerMap.url) as HTMLAnchorElement)?.href || 'No URL';
      const dueDate = row.querySelector(headerMap.dueDate)?.textContent?.trim() || 'No DueDate';
      const isSubmit = row.querySelector(headerMap.isSubmit)?.textContent?.trim() === '미제출' ? false : true;

      if (sbj.length !== 0) subject = sbj;
      return { subject, title, url, dueDate, isSubmit };
    });

    return assignments;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const fetchQuizData = async (link: string) => {
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
        else if (text.includes('제목')) {
          headerMap['title'] = '.cell.' + className;
          headerMap['url'] = headerMap['title'] + ' a';
        } else if (text.includes('종료 일시')) headerMap['dueDate'] = '.cell.' + className;
      }
    });

    let subject: string;
    const rows = Array.from(doc.querySelectorAll('table.generaltable tbody tr'));
    const quizzes = rows
      .map((row) => {
        let sbj = row.querySelector(headerMap.subject)?.textContent?.trim() || '';
        const title = row.querySelector(headerMap.title)?.textContent?.trim() || 'No Title';
        let url = (row.querySelector(headerMap.url) as HTMLAnchorElement)?.href || 'No URL';
        const dueDate = row.querySelector(headerMap.dueDate)?.textContent?.trim() || 'No DueDate';

        if (sbj.length !== 0) subject = sbj;

        if (url) {
          const index = url.indexOf('view');
          url = url.slice(0, index) + 'mod/quiz/' + url.slice(index);
        }
        if (title && dueDate) {
          return { title, subject, url, dueDate };
        }
        return null;
      })
      .filter((quiz) => quiz !== null);

    return quizzes;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const requestData = async (id: string) => {
  const VOD_LINK = getVodLink(id);
  const ASSIGN_LINK = getAssignmentLink(id);
  const QUIZ_LINK = getQuizLink(id);

  try {
    // 비동기 요청들 실행
    const [vodData, assignData, quizData] = await Promise.all([
      fetchVodData(VOD_LINK),
      fetchAssignData(ASSIGN_LINK),
      fetchQuizData(QUIZ_LINK),
    ]);

    // console.log('VOD Data:', vodData);
    // console.log('Assignment Data:', assignData);
    // console.log('Quiz Data:', quizData);

    return { vodData, assignData, quizData };
  } catch (error) {
    console.error('Error while fetching data:', error);
    throw error;
  }
};
