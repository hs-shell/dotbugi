import type { CourseBase } from '@dotbugi/lms-parser';

// 파서와 공유하는 타입은 패키지를 단일 출처로 삼아 정의가 어긋나지 않게 한다
export type { CourseBase, VodAttendanceData } from '@dotbugi/lms-parser';

export type Vod = CourseBase & {
  week: number;
  subject: string;
  title: string;
  url: string;
  range: string | null;
  length: string;
  isAttendance: string;
  weeklyAttendance: string;
  requiredTime?: string;
  watchedTime?: string;
};

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
  isSubmit: boolean;
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
