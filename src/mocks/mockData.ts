import { CourseBase, Vod, Assign, Quiz } from '@/types';

function offsetDate(days: number, hours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function makeRange(startDays: number, endDays: number): string {
  return `${offsetDate(startDays)} ~ ${offsetDate(endDays)}`;
}

export const mockCourses: CourseBase[] = [
  { courseId: '1001', courseTitle: '자료구조', prof: '김교수' },
  { courseId: '1002', courseTitle: '운영체제', prof: '이교수' },
  { courseId: '1003', courseTitle: '컴퓨터네트워크', prof: '박교수' },
  { courseId: '1004', courseTitle: '데이터베이스', prof: '최교수' },
];

export const mockVods: Vod[] = [
  // 출석 완료 + 기간 내
  {
    courseId: '1001',
    courseTitle: '자료구조',
    prof: '김교수',
    week: 7,
    subject: '7주차',
    title: '이진 탐색 트리',
    url: '#',
    range: makeRange(-3, 5),
    length: '45:00',
    isAttendance: 'O',
    weeklyAttendance: '1/1',
  },
  // 결석 + 마감 임박 (오늘 안에 끝남)
  {
    courseId: '1001',
    courseTitle: '자료구조',
    prof: '김교수',
    week: 7,
    subject: '7주차',
    title: '힙과 우선순위 큐',
    url: '#',
    range: makeRange(-5, 0, ),
    length: '38:00',
    isAttendance: 'X',
    weeklyAttendance: '0/1',
  },
  // 결석 + 기간 여유
  {
    courseId: '1002',
    courseTitle: '운영체제',
    prof: '이교수',
    week: 6,
    subject: '6주차',
    title: '프로세스 동기화',
    url: '#',
    range: makeRange(-2, 7),
    length: '50:00',
    isAttendance: 'X',
    weeklyAttendance: '0/1',
  },
  // 출석 완료
  {
    courseId: '1002',
    courseTitle: '운영체제',
    prof: '이교수',
    week: 6,
    subject: '6주차',
    title: '데드락',
    url: '#',
    range: makeRange(-2, 7),
    length: '42:00',
    isAttendance: 'O',
    weeklyAttendance: '1/1',
  },
  // 결석 + 마감 매우 임박 (몇 시간 남음)
  {
    courseId: '1003',
    courseTitle: '컴퓨터네트워크',
    prof: '박교수',
    week: 5,
    subject: '5주차',
    title: 'TCP/IP 프로토콜',
    url: '#',
    range: makeRange(-6, 0),
    length: '55:00',
    isAttendance: 'X',
    weeklyAttendance: '0/2',
  },
  {
    courseId: '1003',
    courseTitle: '컴퓨터네트워크',
    prof: '박교수',
    week: 5,
    subject: '5주차',
    title: 'UDP와 소켓 프로그래밍',
    url: '#',
    range: makeRange(-6, 0),
    length: '35:00',
    isAttendance: 'O',
    weeklyAttendance: '1/2',
  },
  // 출석 + range가 넉넉
  {
    courseId: '1004',
    courseTitle: '데이터베이스',
    prof: '최교수',
    week: 4,
    subject: '4주차',
    title: '정규화 이론',
    url: '#',
    range: makeRange(-1, 14),
    length: '60:00',
    isAttendance: 'O',
    weeklyAttendance: '1/1',
  },
];

export const mockAssigns: Assign[] = [
  // 미제출 + 마감 임박 (내일)
  {
    courseId: '1001',
    courseTitle: '자료구조',
    prof: '김교수',
    subject: '7주차',
    title: '이진 트리 구현 과제',
    url: '#',
    isSubmit: false,
    dueDate: offsetDate(1),
  },
  // 미제출 + 마감 3일 뒤
  {
    courseId: '1002',
    courseTitle: '운영체제',
    prof: '이교수',
    subject: '6주차',
    title: '프로세스 스케줄링 시뮬레이션',
    url: '#',
    isSubmit: false,
    dueDate: offsetDate(3),
  },
  // 제출 완료 + 마감 아직
  {
    courseId: '1001',
    courseTitle: '자료구조',
    prof: '김교수',
    subject: '6주차',
    title: '스택/큐 구현 과제',
    url: '#',
    isSubmit: true,
    dueDate: offsetDate(5),
  },
  // 미제출 + 마감 7일 뒤
  {
    courseId: '1003',
    courseTitle: '컴퓨터네트워크',
    prof: '박교수',
    subject: '5주차',
    title: '소켓 프로그래밍 실습',
    url: '#',
    isSubmit: false,
    dueDate: offsetDate(7),
  },
  // 제출 완료 + 마감 지남 (새로고침 전 마감 테스트)
  {
    courseId: '1004',
    courseTitle: '데이터베이스',
    prof: '최교수',
    subject: '4주차',
    title: 'SQL 쿼리 작성',
    url: '#',
    isSubmit: true,
    dueDate: offsetDate(-1),
  },
  // 미제출 + 마감 몇 시간 뒤 (긴급)
  {
    courseId: '1004',
    courseTitle: '데이터베이스',
    prof: '최교수',
    subject: '5주차',
    title: 'ERD 설계 과제',
    url: '#',
    isSubmit: false,
    dueDate: offsetDate(0, 3),
  },
  // 미제출 + 마감 이미 지남 (새로고침 전 마감 테스트)
  {
    courseId: '1002',
    courseTitle: '운영체제',
    prof: '이교수',
    subject: '5주차',
    title: '메모리 관리 보고서',
    url: '#',
    isSubmit: false,
    dueDate: offsetDate(-2),
  },
  // dueDate null 케이스
  {
    courseId: '1003',
    courseTitle: '컴퓨터네트워크',
    prof: '박교수',
    subject: '6주차',
    title: '네트워크 분석 레포트',
    url: '#',
    isSubmit: false,
    dueDate: null,
  },
];

export const mockQuizes: Quiz[] = [
  // 마감 임박 (내일)
  {
    courseId: '1001',
    courseTitle: '자료구조',
    prof: '김교수',
    subject: '7주차',
    title: '트리 구조 퀴즈',
    url: '#',
    dueDate: offsetDate(1),
  },
  // 마감 여유 (5일)
  {
    courseId: '1002',
    courseTitle: '운영체제',
    prof: '이교수',
    subject: '6주차',
    title: '프로세스 관리 퀴즈',
    url: '#',
    dueDate: offsetDate(5),
  },
  // 마감 몇 시간 뒤 (긴급)
  {
    courseId: '1003',
    courseTitle: '컴퓨터네트워크',
    prof: '박교수',
    subject: '5주차',
    title: 'OSI 모델 퀴즈',
    url: '#',
    dueDate: offsetDate(0, 5),
  },
  // 마감 이미 지남 (새로고침 전 마감)
  {
    courseId: '1004',
    courseTitle: '데이터베이스',
    prof: '최교수',
    subject: '4주차',
    title: 'SQL 기초 퀴즈',
    url: '#',
    dueDate: offsetDate(-1),
  },
  // 마감 2주 뒤
  {
    courseId: '1004',
    courseTitle: '데이터베이스',
    prof: '최교수',
    subject: '5주차',
    title: '정규화 퀴즈',
    url: '#',
    dueDate: offsetDate(14),
  },
  // dueDate null 케이스
  {
    courseId: '1001',
    courseTitle: '자료구조',
    prof: '김교수',
    subject: '8주차',
    title: '그래프 탐색 퀴즈',
    url: '#',
    dueDate: null,
  },
];
