export type CourseBase = {
  courseId: string;
  title: string;
  prof: string;
};

export type VodData = CourseBase & {
  data: {
    items: {
      title: string;
      url: string;
      range: string;
    }[];
    isAttendance: boolean | null;
  }[];
};

export type VodItem = {
  courseId: string;
  title: string;
  prof: string;
  data: {
    items: {
      title: string;
      url: string;
      range: string;
    }[];
    isAttendance: boolean | null;
  };
};

export type AssignData = CourseBase & {
  data: {
    title: string;
    url: string;
    isSubmit: boolean;
    dueDate: string;
  }[];
};

export type AssignItem = {
  courseId: string;
  title: string;
  prof: string;
  data: {
    title: string;
    url: string;
    isSubmit: boolean;
    dueDate: string;
  };
};

export type QuizData = CourseBase & {
  data: {
    title: string;
    url: string;
    dueDate: string;
  }[];
};

export type QuizItem = {
  courseId: string;
  title: string;
  prof: string;
  data: {
    title: string;
    url: string;
    dueDate: string;
  };
};

export type TimeDifferenceResult = {
  message: string;
  borderColor: string;
  textColor: string;
};

export interface Item {
  prof: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

export const TAB_TYPE = {
  VIDEO: 'VIDEO',
  ASSIGN: 'ASSIGN',
  QUIZ: 'QUIZ',
} as const;
