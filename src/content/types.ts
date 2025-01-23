export type VodItem = {
  title: string | null;
  url: string | null;
  range: string | null;
};

export type VodData = {
  items: VodItem[];
  isAttendance: boolean | null;
};

export type AssignData = {
  title: string | null;
  url: string | null;
  isSubmit: boolean;
  dueDate: string | null;
};

export type QuizData = {
  title: string | null;
  url: string | null;
  dueDate: string | null;
};

export type CourseBase = {
  courseId: string;
  title: string;
  prof: string;
};

export type CourseData = CourseBase & {
  data?: {
    vodData: VodData[];
    assignData: AssignData[];
    quizData: QuizData[];
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
  dueDate: number;
  isCompleted: boolean;
}
