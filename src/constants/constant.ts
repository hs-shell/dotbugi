export const BASE_LINK = 'https://learn.hansung.ac.kr' as const;
export const getVodLink = (courseId: string) => {
  return BASE_LINK + `course/view.php?id=${courseId}`;
};
export const getAssignmentLink = (courseId: string) => {
  return BASE_LINK + `/mod/assign/index.php?id=${courseId}`;
};
export const getQuizLink = (courseId: string) => {
  return BASE_LINK + `/mod/quiz/index.php?id=${courseId}`;
};
