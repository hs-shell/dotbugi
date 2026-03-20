import { VodAttendanceData } from '@/types';
import { fetchVodAttendance } from './fetchVodAttendance';
import { fetchVodProgress } from './fetchVodProgress';
import { fetchVodList } from './fetchVodList';
import { getAssignPageLink, getVodProgressPageLink, getIndexPageLink, getQuizPageLink, getVodPageLink } from '@/constants/links';
import { fetchAssign } from './fetchAssign';
import { fetchQuiz } from './fetchQuiz';
import { Quiz } from '@/types';

/**
 * 일반 강좌: user_progress_a.php 출석 데이터에 user_progress.php 시간 데이터를 병합
 * (일괄출석인정 등 기존 출석 판정 유지 + 시청중 배지용 시간 데이터 추가)
 */
function mergeTimeData(
  attendance: VodAttendanceData[],
  progress: VodAttendanceData[],
): VodAttendanceData[] {
  const progressByKey = new Map<string, VodAttendanceData>();
  for (const p of progress) {
    progressByKey.set(`${p.title}-${p.week}`, p);
  }

  return attendance.map((att) => {
    const prog = progressByKey.get(`${att.title}-${att.week}`);
    if (!prog) return att;
    return {
      ...att,
      requiredTime: prog.requiredTime,
      watchedTime: prog.watchedTime,
    };
  });
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

  try {
    // 커뮤니티: user_progress.php만 사용
    // 일반: user_progress_a.php(출석) + user_progress.php(시간 데이터) 병합
    const progressLink = getVodProgressPageLink(courseId);

    const [vodAttendanceRaw, vodProgress, vodList, assignList, quizList] = await Promise.all([
      isCommunity ? Promise.resolve(null) : fetchVodAttendance(getVodPageLink(courseId)),
      fetchVodProgress(progressLink),
      fetchVodList(getIndexPageLink(courseId)),
      fetchAssign(getAssignPageLink(courseId)),
      fetchQuiz(getQuizPageLink(courseId), cachedSubmitMap),
    ]);

    const vodAttendance = isCommunity || !vodAttendanceRaw
      ? vodProgress
      : mergeTimeData(vodAttendanceRaw, vodProgress);

    console.info('[Dotbugi]', vodAttendance, vodList, assignList, quizList);
    return {
      vodAttendanceArray: vodAttendance,
      vodDataArray: vodList,
      assignDataArray: assignList,
      quizDataArray: quizList,
    };
  } catch (error) {
    console.error('[Dotbugi] 강의 데이터 스크래핑 오류:', error);
    throw error;
  }
};
