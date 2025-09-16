import { fetchVodAttendance } from './fetchVodAttendance';
import { fetchIndexPage } from './fetchIndexPage';
import { getAssignPageLink, getIndexPageLink, getQuizPageLink, getVodPageLink } from '@/constants/constant';
import { fetchAssign } from './fetchAssign';
import { fetchQuiz } from './fetchQuiz';

export const requestData = async (id: string) => {
  const VOD_LINK = getVodPageLink(id);
  const INDEX_LINK = getIndexPageLink(id);
  const ASSIGN_LINK = getAssignPageLink(id);
  const QUIZ_LINK = getQuizPageLink(id);

  try {
    const [vodAttendanceArray, vodDataArray, assignDataArray, quizDataArray] = await Promise.all([
      fetchVodAttendance(VOD_LINK),
      fetchIndexPage(INDEX_LINK),
      fetchAssign(ASSIGN_LINK),
      fetchQuiz(QUIZ_LINK),
    ]);

    console.info('[Dotbugi]', vodAttendanceArray, vodDataArray, assignDataArray, quizDataArray);
    return { vodAttendanceArray, vodDataArray, assignDataArray, quizDataArray };
  } catch (error) {
    console.error('Error while fetching data:', error);
    throw error;
  }
};
