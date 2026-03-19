import { describe, it, expect } from 'vitest';
import { mergeVodWithAttendance, mergeDueDateItems } from '@/lib/transformCourseData';
import { CourseBase } from '@/types';

const baseCourse: CourseBase = {
  courseId: 'C1',
  courseTitle: '프로그래밍',
  prof: '김교수',
};

describe('mergeVodWithAttendance', () => {
  it('title+week가 일치하는 항목만 병합', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의1', url: '/v1', range: '2024-01-01 ~ 2024-01-07', length: '30:00' },
      { week: 2, subject: '2주차', title: '강의2', url: '/v2', range: null, length: '45:00' },
    ];
    const attendanceList = [
      { title: '강의1', isAttendance: 'O', weeklyAttendance: 'O', week: 1 },
      // week 2의 출석 데이터 없음
    ];

    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('강의1');
    expect(result[0].isAttendance).toBe('O');
    expect(result[0].courseId).toBe('C1');
  });

  it('빈 vodList이면 빈 배열 반환', () => {
    const result = mergeVodWithAttendance(baseCourse, [], []);
    expect(result).toEqual([]);
  });

  it('빈 attendanceList이면 모든 VOD 누락', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의1', url: '/v1', range: null, length: '30:00' },
    ];
    const result = mergeVodWithAttendance(baseCourse, vodList, []);
    expect(result).toEqual([]);
  });

  it('같은 title이지만 다른 week이면 매칭 안 됨', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의1', url: '/v1', range: null, length: '30:00' },
    ];
    const attendanceList = [
      { title: '강의1', isAttendance: 'O', weeklyAttendance: 'O', week: 2 },
    ];
    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result).toEqual([]);
  });

  it('같은 week이지만 다른 title이면 매칭 안 됨', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의A', url: '/v1', range: null, length: '30:00' },
    ];
    const attendanceList = [
      { title: '강의B', isAttendance: 'O', weeklyAttendance: 'O', week: 1 },
    ];
    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result).toEqual([]);
  });

  it('동일 title+week 출석이 여러 개면 마지막이 사용됨 (Map 덮어쓰기)', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의1', url: '/v1', range: null, length: '30:00' },
    ];
    const attendanceList = [
      { title: '강의1', isAttendance: 'X', weeklyAttendance: 'X', week: 1 },
      { title: '강의1', isAttendance: 'O', weeklyAttendance: 'O', week: 1 },
    ];
    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result[0].isAttendance).toBe('O');
  });

  it('course 정보가 결과에 포함됨', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의1', url: '/v1', range: null, length: '30:00' },
    ];
    const attendanceList = [
      { title: '강의1', isAttendance: 'O', weeklyAttendance: 'O', week: 1 },
    ];
    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result[0].courseTitle).toBe('프로그래밍');
    expect(result[0].prof).toBe('김교수');
  });
});

describe('mergeDueDateItems', () => {
  it('course 정보를 각 항목에 병합', () => {
    const items = [
      { title: '과제1', dueDate: '2024-06-30' },
      { title: '과제2', dueDate: null },
    ];
    const result = mergeDueDateItems(baseCourse, items);
    expect(result).toHaveLength(2);
    expect(result[0].courseId).toBe('C1');
    expect(result[0].title).toBe('과제1');
    expect(result[1].dueDate).toBeNull();
  });

  it('빈 배열이면 빈 배열 반환', () => {
    expect(mergeDueDateItems(baseCourse, [])).toEqual([]);
  });

  it('추가 필드가 있어도 보존됨', () => {
    const items = [{ title: '과제1', dueDate: '2024-06-30', extra: 'value' }];
    const result = mergeDueDateItems(baseCourse, items);
    expect(result[0].extra).toBe('value');
  });

  it('item의 필드가 course 필드와 겹치면 item이 우선', () => {
    // T에 courseTitle이 있으면 spread 순서에 의해 item 값이 우선
    const items = [{ title: '과제1', dueDate: '2024-06-30', courseTitle: '재정의됨' } as { title: string; dueDate: string; courseTitle: string }];
    const result = mergeDueDateItems(baseCourse, items);
    expect(result[0].courseTitle).toBe('재정의됨');
  });
});

describe('mergeVodWithAttendance - 추가 edge cases', () => {
  it('대량 데이터 매칭', () => {
    const vodList = Array.from({ length: 100 }, (_, i) => ({
      week: i, subject: `${i}주차`, title: `강의${i}`, url: `/v${i}`, range: null, length: '30:00',
    }));
    const attendanceList = Array.from({ length: 100 }, (_, i) => ({
      title: `강의${i}`, isAttendance: i % 2 === 0 ? 'O' : 'X', weeklyAttendance: 'O', week: i,
    }));
    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result).toHaveLength(100);
  });

  it('title에 특수문자가 포함된 경우 정확한 매칭', () => {
    const vodList = [
      { week: 1, subject: '1주차', title: '강의-1(A)', url: '/v1', range: null, length: '30:00' },
    ];
    const attendanceList = [
      { title: '강의-1(A)', isAttendance: 'O', weeklyAttendance: 'O', week: 1 },
    ];
    const result = mergeVodWithAttendance(baseCourse, vodList, attendanceList);
    expect(result).toHaveLength(1);
  });

  it('isCommunity 필드가 course에서 전파됨', () => {
    const communityCourse: CourseBase = { ...baseCourse, isCommunity: true };
    const vodList = [
      { week: 1, subject: '1주차', title: '강의1', url: '/v1', range: null, length: '30:00' },
    ];
    const attendanceList = [
      { title: '강의1', isAttendance: 'O', weeklyAttendance: 'O', week: 1 },
    ];
    const result = mergeVodWithAttendance(communityCourse, vodList, attendanceList);
    expect(result[0].isCommunity).toBe(true);
  });
});
