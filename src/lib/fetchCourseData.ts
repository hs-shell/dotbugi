import { fetchVodAttendance } from './fetchVodAttendance';
import { fetchVodProgress } from './fetchVodProgress';
import { fetchVodList } from './fetchVodList';
import { getAssignPageLink, getVodProgressPageLink, getIndexPageLink, getQuizPageLink, getVodPageLink } from '@/constants/links';
import { fetchAssign } from './fetchAssign';
import { fetchQuiz } from './fetchQuiz';
import { Quiz } from '@/types';
import { logger } from './logger';

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  if (result.status === 'fulfilled') return result.value;
  logger.course.warn(result.reason?.message ?? result.reason);
  return fallback;
}

export const scrapeCourseData = async (
  courseId: string,
  cachedQuizzes?: Quiz[],
  isCommunity?: boolean,
) => {
  // 캐시된 퀴즈의 제출 상태 맵 생성 (url → isSubmit)
  const cachedSubmitMap = cachedQuizzes
    ? new Map(cachedQuizzes.map((q) => [q.url, q.isSubmit]))
    : undefined;

  // 일반 강좌: _a.php 우선, 실패 시 .php 폴백
  // 커뮤니티: .php만 사용 (_a.php 접근 불가)
  const progressLink = getVodProgressPageLink(courseId);

  const results = await Promise.allSettled([
    isCommunity ? Promise.resolve(null) : fetchVodAttendance(getVodPageLink(courseId)),
    fetchVodProgress(progressLink),
    fetchVodList(getIndexPageLink(courseId)),
    fetchAssign(getAssignPageLink(courseId)),
    fetchQuiz(getQuizPageLink(courseId), cachedSubmitMap),
  ]);

  const vodAttendanceRaw = settled(results[0], null);
  const vodProgress = settled(results[1], []);
  const vodList = settled(results[2], []);
  const assignList = settled(results[3], []);
  const quizList = settled(results[4], []);

  // 모든 요청이 실패하면 에러로 처리
  const allFailed = results.every((r) => r.status === 'rejected');
  if (allFailed) {
    throw new Error('모든 강의 데이터 요청 실패');
  }

  // 일반 강좌: _a.php 데이터 사용 (출석 + 시간 데이터 포함)
  // _a.php 실패 또는 커뮤니티: .php 폴백 (시간 비교 기반 출석 판정)
  const vodAttendance = isCommunity || !vodAttendanceRaw
    ? vodProgress
    : vodAttendanceRaw;

  return {
    vodAttendanceArray: vodAttendance,
    vodDataArray: vodList,
    assignDataArray: assignList,
    quizDataArray: quizList,
  };
};
