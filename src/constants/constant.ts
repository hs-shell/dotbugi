export const BASE_LINK = 'https://learn.hansung.ac.kr' as const;
export const getVodPageLink = (courseId: string) => {
  return BASE_LINK + `/report/ubcompletion/user_progress_a.php?id=${courseId}`;
  return BASE_LINK + `/course/view.php?id=${courseId}`;
};
export const getAssignPageLink = (courseId: string) => {
  return BASE_LINK + `/mod/assign/index.php?id=${courseId}`;
};
export const getQuizPageLink = (courseId: string) => {
  return BASE_LINK + `/mod/quiz/index.php?id=${courseId}`;
};
export const getIndexPageLink = (courseId: string) => {
  return BASE_LINK + `/course/view.php?id=${courseId}`;
};
