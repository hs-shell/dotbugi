import { fetchHtml, getText } from './fetchHtml';
import { BASE_LINK } from '@/constants/links';

// 퀴즈 테이블 컬럼 (generaltable)
// [주(c0)] [제목(c1)] [종료 일시(c2)] [성적(c3)]
const COL = {
  WEEK: '.cell.c0',
  TITLE_LINK: '.cell.c1 a',
  DUE_DATE: '.cell.c2',
} as const;

/**
 * 상대/절대 경로를 퀴즈 모듈 절대 URL로 변환
 * view.php?id=123 → https://learn.hansung.ac.kr/mod/quiz/view.php?id=123
 */
function toQuizUrl(rawHref: string): string {
  if (rawHref.startsWith('http')) return rawHref;
  return `${BASE_LINK}/mod/quiz/${rawHref}`;
}

export const fetchQuiz = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const rows = doc.querySelectorAll('table.generaltable tbody tr');

    let lastWeekLabel = '';

    return Array.from(rows)
      .map((row) => {
        const weekLabel = getText(row, COL.WEEK);
        const titleLink = row.querySelector(COL.TITLE_LINK) as HTMLAnchorElement | null;
        const title = titleLink?.textContent?.trim() || null;
        const rawHref = titleLink?.getAttribute('href') || null;
        const dueDate = getText(row, COL.DUE_DATE);

        if (weekLabel) lastWeekLabel = weekLabel;
        if (!title || !rawHref || !dueDate) return null;

        return { title, subject: lastWeekLabel, url: toQuizUrl(rawHref), dueDate };
      })
      .filter((item) => item !== null);
  } catch (error) {
    console.error('[Dotbugi] 퀴즈 조회 오류:', error);
    throw error;
  }
};
