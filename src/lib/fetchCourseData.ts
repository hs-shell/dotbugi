import { fetchVodAttendance } from './fetchVodAttendance';
import { fetchVodList } from './fetchVodList';
import { getAssignPageLink, getIndexPageLink, getQuizPageLink, getVodPageLink } from '@/constants/links';
import { fetchAssign } from './fetchAssign';
import { fetchQuiz } from './fetchQuiz';
import { Quiz } from '@/types';

export const scrapeCourseData = async (
  courseId: string,
  cachedQuizzes?: Quiz[],
) => {
  // 캐시된 퀴즈의 제출 상태 맵 생성 (url → isSubmit)
  const cachedSubmitMap = cachedQuizzes
    ? new Map(cachedQuizzes.map((q) => [q.url, q.isSubmit]))
    : undefined;

  try {
    const [vodAttendance, vodList, assignList, quizList] = await Promise.all([
      fetchVodAttendance(getVodPageLink(courseId)),
      fetchVodList(getIndexPageLink(courseId)),
      fetchAssign(getAssignPageLink(courseId)),
      fetchQuiz(getQuizPageLink(courseId), cachedSubmitMap),
    ]);

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
