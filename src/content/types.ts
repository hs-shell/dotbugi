export type CourseBase = {
  courseId: string;
  courseTitle: string;
  prof: string;
};

export type Vod = CourseBase & VodDetail;

export type VodDetail = VodData & VodAttendanceData;

export type VodData = {
  week: number;
  subject: string;
  title: string;
  url: string;
  range: string | null;
  length: string;
};

export interface VodAttendanceData {
  title: string;
  isAttendance: string;
  weeklyAttendance: string;
  week: number;
}

export type Assign = CourseBase & AssignData;

export type AssignData = {
  subject: string;
  title: string;
  url: string;
  isSubmit: boolean;
  dueDate: string | null;
};

export type Quiz = CourseBase & QuizData;

export type QuizData = {
  subject: string;
  title: string;
  url: string;
  dueDate: string | null;
};

export type TimeDifferenceResult = {
  message: string;
  borderColor: string;
  borderLeftColor: string;
  textColor: string;
};

export interface Item {
  prof: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface Filters {
  courseTitles: string[];
  attendanceStatuses?: string[];
  submitStatuses?: boolean[];
}

export enum TAB_TYPE {
  VIDEO = 'VIDEO',
  ASSIGN = 'ASSIGN',
  QUIZ = 'QUIZ',
}

export enum TYPES {
  vod = '강의',
  assignment = '과제',
  quiz = '퀴즈',
}
