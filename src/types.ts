export type CourseBase = {
  courseId: string;
  courseTitle: string;
  prof: string;
  isCommunity?: boolean;
};

export type Vod = CourseBase & {
  week: number;
  subject: string;
  title: string;
  url: string;
  range: string | null;
  length: string;
  isAttendance: string;
  weeklyAttendance: string;
};

export interface VodAttendanceData {
  title: string;
  isAttendance: string;
  weeklyAttendance: string;
  week: number;
}

export type Assign = CourseBase & {
  subject: string;
  title: string;
  url: string;
  isSubmit: boolean;
  dueDate: string | null;
};

export type Quiz = CourseBase & {
  subject: string;
  title: string;
  url: string;
  dueDate: string | null;
};

export type TimeDifferenceResult = {
  message: string;
  status: 'noInfo' | 'expired' | 'daysLeft' | 'urgent' | 'invalid';
  borderColor: string;
  borderLeftColor: string;
  textColor: string;
};

export interface Filters {
  courseTitles: string[];
  attendanceStatuses?: string[];
  submitStatuses?: boolean[];
}

export enum TAB_TYPE {
  VIDEO = 'VIDEO',
  ASSIGN = 'ASSIGN',
  QUIZ = 'QUIZ',
  SETTING = 'SETTING',
}
