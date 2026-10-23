import { scrapeCourseData as scrapeLmsCourseData } from '@dotbugi/lms-parser';

import { fetchHtml } from './fetchHtml';
import { Quiz } from '@/types';
import { logger } from './logger';

/** 공용 LMS 파서에 브라우저용 fetchHtml(재시도 포함)과 로거를 주입해 한 강좌 데이터를 조회 */
export const scrapeCourseData = (courseId: string, cachedQuizzes?: Quiz[], isCommunity?: boolean) =>
  scrapeLmsCourseData(fetchHtml, courseId, {
    cachedQuizzes,
    isCommunity,
    // 부분 실패는 빈 값으로 대체되므로 로그만 남긴다 (reason은 보통 Error)
    onError: (reason) => logger.course.warn((reason as Error | undefined)?.message ?? reason),
  });
