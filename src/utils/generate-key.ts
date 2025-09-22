export const makeVodKey = (courseId: string, title: string, week: number) => `${courseId}-${title}-${week}`;
export const makeAssignKey = (courseId: string, title: string, dueDate: string) => `${courseId}-${title}-${dueDate}`;
export const makeQuizKey = (courseId: string, title: string, dueDate: string) => `${courseId}-${title}-${dueDate}`;
