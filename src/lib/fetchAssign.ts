import { fetchHtml, getText, getHref } from './fetchHtml';

// 과제 테이블 컬럼 (generaltable)
// [주(c0)] [과제(c1)] [종료 일시(c2)] [제출(c3)] [성적(c4)]
const COL = {
  WEEK: '.cell.c0',
  TITLE_LINK: '.cell.c1 a',
  DUE_DATE: '.cell.c2',
  SUBMIT_STATUS: '.cell.c3',
} as const;

import { NOT_SUBMITTED, normalizeLmsDate } from './lmsKeywords';

export const fetchAssign = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const rows = doc.querySelectorAll('table.generaltable tbody tr');

    let lastWeekLabel = '';

    return Array.from(rows).flatMap((row) => {
      const weekLabel = getText(row, COL.WEEK);
      if (weekLabel) lastWeekLabel = weekLabel;

      const title = getText(row, COL.TITLE_LINK);
      const url = getHref(row, COL.TITLE_LINK);
      const rawDueDate = getText(row, COL.DUE_DATE)?.trim();
      if (!title || !url) return [];
      const dueDate = rawDueDate && rawDueDate !== '-' ? normalizeLmsDate(rawDueDate) ?? null : null;

      const submitText = getText(row, COL.SUBMIT_STATUS) ?? '';
      const isSubmit = !NOT_SUBMITTED.some((keyword) => submitText.includes(keyword));
      return { subject: lastWeekLabel, title, url, dueDate, isSubmit };
    });
  } catch (error) {
    throw new Error(`과제 조회 실패`, { cause: error });
  }
};
