export type CourseBase = {
  courseId: string;
  title: string;
  prof: string;
};

export type VodData = CourseBase & {
  subject: string;
  data: {
    items: {
      title: string;
      url: string;
      range: string;
      length: string;
    }[];
    isAttendance: boolean | null;
  }[];
};

export type VodItem = {
  courseId: string;
  title: string;
  prof: string;
  subject: string;
  data: {
    items: {
      title: string;
      url: string;
      range: string;
      length: string;
    }[];
    isAttendance: boolean | null;
  };
};

export type AssignData = CourseBase & {
  subject: string;
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
  subject: string;
  data: {
    title: string;
    url: string;
    isSubmit: boolean;
    dueDate: string;
  };
};

export type QuizData = CourseBase & {
  subject: string;
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
  subject: string;
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
