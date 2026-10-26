import { scrapeCourseData as scrapeLmsCourseData } from '@dotbugi/lms-parser';

import { fetchHtml } from './fetchHtml';
import { Quiz } from '@/types';
import { logger } from './logger';

/**
 * 공용 LMS 파서에 브라우저용 fetchHtml(재시도 포함)과 로거를 주입해 한 강좌 데이터를 조회.
 * signal 로 중단되면 reject 한다 — 파서는 부분 실패를 빈 값으로 채워 resolve 하므로, 그대로 저장하면 기존 데이터가 지워진다
 */
export async function scrapeCourseData(
  courseId: string,
  cachedQuizzes?: Quiz[],
  isCommunity?: boolean,
  signal?: AbortSignal
) {
  const result = await scrapeLmsCourseData(signal ? (link) => fetchHtml(link, signal) : fetchHtml, courseId, {
    cachedQuizzes,
    isCommunity,
    // 부분 실패는 빈 값으로 대체되므로 로그만 남긴다 (reason은 보통 Error)
    onError: (reason) => logger.course.warn((reason as Error | undefined)?.message ?? reason),
  });
  signal?.throwIfAborted();
  return result;
}
