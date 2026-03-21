import { fetchHtml, getText } from './fetchHtml';
import { BASE_LINK } from '@/constants/links';
import { normalizeLmsDate } from './lmsKeywords';
import { isCurrentDateByDate } from './dateUtils';

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

/**
 * 퀴즈 상세 페이지에서 제출 여부를 확인
 * quizattemptsummary 테이블에 행이 있으면 제출된 것으로 판단
 */
async function fetchQuizSubmitStatus(quizUrl: string): Promise<boolean> {
  try {
    const doc = await fetchHtml(quizUrl);
    const rows = doc.querySelectorAll('table.quizattemptsummary tbody tr');
    return rows.length > 0;
  } catch {
    return false;
  }
}

type QuizItem = {
  title: string;
  subject: string;
  url: string;
  dueDate: string | null;
  isSubmit: boolean;
};

/**
 * 퀴즈 목록 + 제출 여부 조회
 * @param cachedSubmitMap 이전에 저장된 퀴즈별 제출 상태 (key: url)
 *   마감된 퀴즈는 상세 페이지를 다시 fetch하지 않고 캐시된 값을 사용
 */
export const fetchQuiz = async (
  link: string,
  cachedSubmitMap?: Map<string, boolean>,
) => {
  try {
    const doc = await fetchHtml(link);
    const rows = doc.querySelectorAll('table.generaltable tbody tr');

    let lastWeekLabel = '';

    const quizItems: Omit<QuizItem, 'isSubmit'>[] = Array.from(rows)
      .flatMap((row) => {
        const weekLabel = getText(row, COL.WEEK);
        if (weekLabel) lastWeekLabel = weekLabel;

        const titleLink = row.querySelector<HTMLAnchorElement>(COL.TITLE_LINK);
        const rawDueDate = getText(row, COL.DUE_DATE)?.trim();
        if (!titleLink) return [];
        const dueDate = rawDueDate && rawDueDate !== '-' ? normalizeLmsDate(rawDueDate) ?? null : null;

        const title = titleLink.textContent?.trim();
        const rawHref = titleLink.getAttribute('href');
        if (!title || !rawHref) return [];

        return { title, subject: lastWeekLabel, url: toQuizUrl(rawHref), dueDate };
      });

    // 마감 전 퀴즈만 상세 페이지 fetch, 마감된 퀴즈는 캐시 사용
    const results: QuizItem[] = await Promise.all(
      quizItems.map(async (item) => {
        const isExpired = item.dueDate ? !isCurrentDateByDate(item.dueDate) : false;

        if (isExpired && cachedSubmitMap?.has(item.url)) {
          return { ...item, isSubmit: cachedSubmitMap.get(item.url)! };
        }

        const isSubmit = await fetchQuizSubmitStatus(item.url);
        return { ...item, isSubmit };
      }),
    );

    return results;
  } catch (error) {
    throw new Error(`퀴즈 조회 실패`, { cause: error });
  }
};
