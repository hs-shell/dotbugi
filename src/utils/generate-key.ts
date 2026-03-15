export const makeVodKey = (courseId: string, title: string, week: number) => `${courseId}-${title}-${week}`;
export const makeItemKey = (courseId: string, title: string, dueDate: string) => `${courseId}-${title}-${dueDate}`;
export const makeVodGroupKey = (courseId: string, subject: string, range: string | null) =>
  `${courseId}-${subject}-${range}`;
