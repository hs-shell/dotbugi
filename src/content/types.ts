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
  range: string;
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
  dueDate: string;
};

export type Quiz = CourseBase & QuizData;

export type QuizData = {
  subject: string;
  title: string;
  url: string;
  dueDate: string;
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

export interface Filters {
  courseTitles: string[];
  attendanceStatuses?: string[]; // Vods용
  submitStatuses?: boolean[]; // Assigns용
}

export enum TAB_TYPE {
  VIDEO = 'VIDEO',
  ASSIGN = 'ASSIGN',
  QUIZ = 'QUIZ',
}
