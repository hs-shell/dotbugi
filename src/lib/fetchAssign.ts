import { fetchHtml, getText, getHref } from './fetchHtml';

// 과제 테이블 컬럼 (generaltable)
// [주(c0)] [과제(c1)] [종료 일시(c2)] [제출(c3)] [성적(c4)]
const COL = {
  WEEK: '.cell.c0',
  TITLE_LINK: '.cell.c1 a',
  DUE_DATE: '.cell.c2',
  SUBMIT_STATUS: '.cell.c3',
} as const;

const NOT_SUBMITTED = '미제출';

export const fetchAssign = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const rows = doc.querySelectorAll('table.generaltable tbody tr');

    let lastWeekLabel = '';

    return Array.from(rows)
      .map((row) => {
        const weekLabel = getText(row, COL.WEEK);
        const title = getText(row, COL.TITLE_LINK);
        const url = getHref(row, COL.TITLE_LINK);
        const dueDate = getText(row, COL.DUE_DATE);
        const isSubmit = getText(row, COL.SUBMIT_STATUS) !== NOT_SUBMITTED;

        if (weekLabel) lastWeekLabel = weekLabel;
        if (!title || !url || !dueDate) return null;

        return { subject: lastWeekLabel, title, url, dueDate, isSubmit };
      })
      .filter((item) => item !== null);
  } catch (error) {
    console.error('[Dotbugi] 과제 조회 오류:', error);
    throw error;
  }
};
