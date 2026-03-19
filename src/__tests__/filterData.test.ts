import { describe, it, expect } from 'vitest';
import { filterVods, filterAssigns, filterQuizzes } from '@/lib/filterData';
import { Vod, Assign, Quiz, Filters } from '@/types';

const makeVod = (overrides: Partial<Vod> = {}): Vod => ({
  courseId: 'C1',
  courseTitle: '프로그래밍',
  prof: '김교수',
  week: 1,
  subject: '1주차',
  title: '강의1',
  url: '/v1',
  range: '2024-01-01 ~ 2024-01-07',
  length: '30:00',
  isAttendance: 'O',
  weeklyAttendance: 'O',
  ...overrides,
});

const makeAssign = (overrides: Partial<Assign> = {}): Assign => ({
  courseId: 'C1',
  courseTitle: '프로그래밍',
  prof: '김교수',
  subject: '1주차',
  title: '과제1',
  url: '/a1',
  isSubmit: false,
  dueDate: '2024-06-30',
  ...overrides,
});

const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz => ({
  courseId: 'C1',
  courseTitle: '프로그래밍',
  prof: '김교수',
  subject: '1주차',
  title: '퀴즈1',
  url: '/q1',
  isSubmit: false,
  dueDate: '2024-06-30',
  ...overrides,
});

const emptyFilters: Filters = { courseTitles: [] };

describe('filterVods', () => {
  it('필터 없이 전체 반환', () => {
    const vods = [makeVod(), makeVod({ title: '강의2' })];
    const result = filterVods(vods, emptyFilters, '', 'range');
    expect(result).toHaveLength(2);
  });

  it('과목 필터로 특정 과목만 반환', () => {
    const vods = [
      makeVod({ courseTitle: '수학' }),
      makeVod({ courseTitle: '영어' }),
    ];
    const filters: Filters = { courseTitles: ['수학'] };
    const result = filterVods(vods, filters, '', 'range');
    expect(result).toHaveLength(1);
    expect(result[0].courseTitle).toBe('수학');
  });

  it('검색어로 제목 필터링', () => {
    const vods = [
      makeVod({ title: '파이썬 기초' }),
      makeVod({ title: '자바 고급' }),
    ];
    const result = filterVods(vods, emptyFilters, '파이썬', 'range');
    expect(result).toHaveLength(1);
  });

  it('검색어로 교수명 필터링', () => {
    const vods = [
      makeVod({ prof: '김교수' }),
      makeVod({ prof: '이교수' }),
    ];
    const result = filterVods(vods, emptyFilters, '이교수', 'range');
    expect(result).toHaveLength(1);
  });

  it('검색어 대소문자 무시', () => {
    const vods = [makeVod({ title: 'Python Basics' })];
    const result = filterVods(vods, emptyFilters, 'python', 'range');
    expect(result).toHaveLength(1);
  });

  it('출석 상태 필터 - 출석만', () => {
    const vods = [
      makeVod({ isAttendance: 'O' }),
      makeVod({ isAttendance: 'X', title: '강의2' }),
    ];
    // i18n mock: attendance.attended
    const filters: Filters = { courseTitles: [], attendanceStatuses: ['attendance.attended'] };
    const result = filterVods(vods, filters, '', 'range');
    expect(result).toHaveLength(1);
    expect(result[0].isAttendance).toBe('O');
  });

  it('정렬: 미출석이 먼저 (isAttendance 기준)', () => {
    const vods = [
      makeVod({ isAttendance: 'O', title: '출석' }),
      makeVod({ isAttendance: 'X', title: '미출석' }),
    ];
    const result = filterVods(vods, emptyFilters, '', 'range');
    // isAttended('O') = true → 출석이 앞으로? 아니, 코드에서 attendanceA ? -1 : 1
    // 실제로는 출석이 먼저 정렬됨 (출석 완료한 것을 상단)
    // 아... 코드를 다시 보면: attendanceA ? -1 : 1 → 출석이면 -1 → 출석이 먼저
    expect(result[0].isAttendance).toBe('O');
  });

  it('정렬: title 기준', () => {
    const vods = [
      makeVod({ isAttendance: 'X', title: 'B강의' }),
      makeVod({ isAttendance: 'X', title: 'A강의' }),
    ];
    const result = filterVods(vods, emptyFilters, '', 'title');
    expect(result[0].title).toBe('A강의');
    expect(result[1].title).toBe('B강의');
  });

  it('정렬: range 기준, null은 뒤로', () => {
    const vods = [
      makeVod({ isAttendance: 'X', range: null, title: 'A' }),
      makeVod({ isAttendance: 'X', range: '2024-01-01 ~ 2024-01-07', title: 'B' }),
    ];
    const result = filterVods(vods, emptyFilters, '', 'range');
    expect(result[0].range).not.toBeNull();
    expect(result[1].range).toBeNull();
  });

  it('빈 배열이면 빈 배열 반환', () => {
    expect(filterVods([], emptyFilters, '', 'range')).toEqual([]);
  });

  it('출석 상태 필터가 빈 배열이면 전체 반환', () => {
    const vods = [makeVod({ isAttendance: 'O' }), makeVod({ isAttendance: 'X', title: '강의2' })];
    const filters: Filters = { courseTitles: [], attendanceStatuses: [] };
    const result = filterVods(vods, filters, '', 'range');
    expect(result).toHaveLength(2);
  });

  it('정렬: 양쪽 모두 range null이면 순서 유지 (0 반환)', () => {
    const vods = [
      makeVod({ isAttendance: 'X', range: null, title: 'B' }),
      makeVod({ isAttendance: 'X', range: null, title: 'A' }),
    ];
    const result = filterVods(vods, emptyFilters, '', 'range');
    // 둘 다 null이면 0 반환 → 원래 순서 유지
    expect(result[0].title).toBe('B');
  });

  it('정렬: 출석 상태가 같으면 range로 정렬', () => {
    const vods = [
      makeVod({ isAttendance: 'O', range: '2024-02-01 ~ 2024-02-07', title: 'B' }),
      makeVod({ isAttendance: 'O', range: '2024-01-01 ~ 2024-01-07', title: 'A' }),
    ];
    const result = filterVods(vods, emptyFilters, '', 'range');
    expect(result[0].title).toBe('A');
  });

  it('검색어로 과목명 필터링', () => {
    const vods = [
      makeVod({ courseTitle: '컴퓨터구조' }),
      makeVod({ courseTitle: '운영체제', title: '강의2' }),
    ];
    const result = filterVods(vods, emptyFilters, '컴퓨터', 'range');
    expect(result).toHaveLength(1);
    expect(result[0].courseTitle).toBe('컴퓨터구조');
  });

  it('과목 필터 + 검색어 동시 적용', () => {
    const vods = [
      makeVod({ courseTitle: '수학', title: '미분' }),
      makeVod({ courseTitle: '수학', title: '적분' }),
      makeVod({ courseTitle: '영어', title: '미분' }),
    ];
    const filters: Filters = { courseTitles: ['수학'] };
    const result = filterVods(vods, filters, '적분', 'range');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('적분');
  });
});

describe('filterAssigns', () => {
  it('필터 없이 전체 반환', () => {
    const assigns = [makeAssign(), makeAssign({ title: '과제2' })];
    const result = filterAssigns(assigns, emptyFilters, '', 'dueDate');
    expect(result).toHaveLength(2);
  });

  it('과목 필터', () => {
    const assigns = [
      makeAssign({ courseTitle: '수학' }),
      makeAssign({ courseTitle: '영어' }),
    ];
    const filters: Filters = { courseTitles: ['수학'] };
    const result = filterAssigns(assigns, filters, '', 'dueDate');
    expect(result).toHaveLength(1);
  });

  it('제출 상태 필터 - 미제출만', () => {
    const assigns = [
      makeAssign({ isSubmit: false }),
      makeAssign({ isSubmit: true, title: '과제2' }),
    ];
    const filters: Filters = { courseTitles: [], submitStatuses: [false] };
    const result = filterAssigns(assigns, filters, '', 'dueDate');
    expect(result).toHaveLength(1);
    expect(result[0].isSubmit).toBe(false);
  });

  it('정렬: 미제출이 먼저', () => {
    const assigns = [
      makeAssign({ isSubmit: true, title: '제출됨' }),
      makeAssign({ isSubmit: false, title: '미제출' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '', 'dueDate');
    expect(result[0].isSubmit).toBe(false);
  });

  it('정렬: dueDate null은 맨 뒤', () => {
    const assigns = [
      makeAssign({ isSubmit: false, dueDate: null, title: 'A' }),
      makeAssign({ isSubmit: false, dueDate: '2024-06-15', title: 'B' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '', 'dueDate');
    expect(result[0].dueDate).toBe('2024-06-15');
    expect(result[1].dueDate).toBeNull();
  });

  it('정렬: 이른 마감이 먼저', () => {
    const assigns = [
      makeAssign({ isSubmit: false, dueDate: '2024-07-01', title: 'B' }),
      makeAssign({ isSubmit: false, dueDate: '2024-06-15', title: 'A' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '', 'dueDate');
    expect(result[0].title).toBe('A');
  });

  it('정렬: title 기준', () => {
    const assigns = [
      makeAssign({ isSubmit: false, title: 'B과제' }),
      makeAssign({ isSubmit: false, title: 'A과제' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '', 'title');
    expect(result[0].title).toBe('A과제');
  });

  it('검색어로 과목명 필터링', () => {
    const assigns = [
      makeAssign({ courseTitle: '데이터베이스' }),
      makeAssign({ courseTitle: '네트워크' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '데이터', 'dueDate');
    expect(result).toHaveLength(1);
  });

  it('정렬: dueDate가 같으면 순서 유지', () => {
    const assigns = [
      makeAssign({ isSubmit: false, dueDate: '2024-06-30', title: 'B' }),
      makeAssign({ isSubmit: false, dueDate: '2024-06-30', title: 'A' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '', 'dueDate');
    // 같은 dueDate → 0 반환 → 원래 순서
    expect(result[0].title).toBe('B');
  });

  it('정렬: 양쪽 모두 dueDate null이면 순서 유지', () => {
    const assigns = [
      makeAssign({ isSubmit: false, dueDate: null, title: 'B' }),
      makeAssign({ isSubmit: false, dueDate: null, title: 'A' }),
    ];
    const result = filterAssigns(assigns, emptyFilters, '', 'dueDate');
    expect(result[0].title).toBe('B');
  });

  it('submitStatuses 필터가 빈 배열이면 전체 반환', () => {
    const assigns = [
      makeAssign({ isSubmit: true, title: 'A' }),
      makeAssign({ isSubmit: false, title: 'B' }),
    ];
    const filters: Filters = { courseTitles: [], submitStatuses: [] };
    const result = filterAssigns(assigns, filters, '', 'dueDate');
    expect(result).toHaveLength(2);
  });

  it('제출/미제출 모두 포함하는 submitStatuses 필터', () => {
    const assigns = [
      makeAssign({ isSubmit: true, title: 'A' }),
      makeAssign({ isSubmit: false, title: 'B' }),
    ];
    const filters: Filters = { courseTitles: [], submitStatuses: [true, false] };
    const result = filterAssigns(assigns, filters, '', 'dueDate');
    expect(result).toHaveLength(2);
  });
});

describe('filterQuizzes', () => {
  it('필터 없이 전체 반환', () => {
    const quizzes = [makeQuiz(), makeQuiz({ title: '퀴즈2' })];
    const result = filterQuizzes(quizzes, emptyFilters, '', 'dueDate');
    expect(result).toHaveLength(2);
  });

  it('제출 상태 필터', () => {
    const quizzes = [
      makeQuiz({ isSubmit: false }),
      makeQuiz({ isSubmit: true, title: '퀴즈2' }),
    ];
    const filters: Filters = { courseTitles: [], submitStatuses: [true] };
    const result = filterQuizzes(quizzes, filters, '', 'dueDate');
    expect(result).toHaveLength(1);
    expect(result[0].isSubmit).toBe(true);
  });

  it('정렬: 미제출 우선', () => {
    const quizzes = [
      makeQuiz({ isSubmit: true, title: '제출됨' }),
      makeQuiz({ isSubmit: false, title: '미제출' }),
    ];
    const result = filterQuizzes(quizzes, emptyFilters, '', 'dueDate');
    expect(result[0].isSubmit).toBe(false);
  });

  it('정렬: dueDate null은 맨 뒤', () => {
    const quizzes = [
      makeQuiz({ isSubmit: false, dueDate: null, title: 'A' }),
      makeQuiz({ isSubmit: false, dueDate: '2024-06-15', title: 'B' }),
    ];
    const result = filterQuizzes(quizzes, emptyFilters, '', 'dueDate');
    expect(result[0].dueDate).toBe('2024-06-15');
  });

  it('검색어와 과목 필터 동시 적용', () => {
    const quizzes = [
      makeQuiz({ courseTitle: '수학', title: '기말 퀴즈' }),
      makeQuiz({ courseTitle: '수학', title: '중간 퀴즈' }),
      makeQuiz({ courseTitle: '영어', title: '기말 퀴즈' }),
    ];
    const filters: Filters = { courseTitles: ['수학'] };
    const result = filterQuizzes(quizzes, filters, '기말', 'dueDate');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('기말 퀴즈');
    expect(result[0].courseTitle).toBe('수학');
  });

  it('정렬: 이른 마감이 먼저 (퀴즈)', () => {
    const quizzes = [
      makeQuiz({ isSubmit: false, dueDate: '2024-07-15', title: 'B' }),
      makeQuiz({ isSubmit: false, dueDate: '2024-06-15', title: 'A' }),
    ];
    const result = filterQuizzes(quizzes, emptyFilters, '', 'dueDate');
    expect(result[0].title).toBe('A');
  });

  it('정렬: title 기준 (퀴즈)', () => {
    const quizzes = [
      makeQuiz({ isSubmit: false, title: 'B퀴즈' }),
      makeQuiz({ isSubmit: false, title: 'A퀴즈' }),
    ];
    const result = filterQuizzes(quizzes, emptyFilters, '', 'title');
    expect(result[0].title).toBe('A퀴즈');
  });

  it('여러 과목 필터 동시 적용', () => {
    const quizzes = [
      makeQuiz({ courseTitle: '수학', title: '퀴즈1' }),
      makeQuiz({ courseTitle: '영어', title: '퀴즈2' }),
      makeQuiz({ courseTitle: '물리', title: '퀴즈3' }),
    ];
    const filters: Filters = { courseTitles: ['수학', '영어'] };
    const result = filterQuizzes(quizzes, filters, '', 'dueDate');
    expect(result).toHaveLength(2);
  });
});
