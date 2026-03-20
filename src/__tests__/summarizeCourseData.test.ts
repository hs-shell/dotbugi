import { describe, it, expect } from 'vitest';
import { summarizeVods } from '@/lib/summarizeCourseData';
import { Vod } from '@/types';

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

describe('summarizeVods', () => {
  it('빈 배열이면 done=0, total=0', () => {
    expect(summarizeVods([])).toEqual({ done: 0, total: 0 });
  });

  it('같은 그룹의 VOD들은 하나로 카운트', () => {
    const vods = [
      makeVod({ title: '파트1' }),
      makeVod({ title: '파트2' }),
    ]; // 같은 courseId+subject+range → 1그룹
    const result = summarizeVods(vods);
    expect(result.total).toBe(1);
  });

  it('다른 그룹은 별도 카운트', () => {
    const vods = [
      makeVod({ subject: '1주차' }),
      makeVod({ subject: '2주차' }),
    ];
    const result = summarizeVods(vods);
    expect(result.total).toBe(2);
  });

  it('weeklyAttendance가 O이면 done 카운트', () => {
    const vods = [
      makeVod({ subject: '1주차', weeklyAttendance: 'O' }),
      makeVod({ subject: '2주차', weeklyAttendance: 'X' }),
    ];
    const result = summarizeVods(vods);
    expect(result.done).toBe(1);
    expect(result.total).toBe(2);
  });

  it('그룹의 첫 번째 항목의 weeklyAttendance로 판단', () => {
    const vods = [
      makeVod({ title: '파트1', weeklyAttendance: 'O' }),
      makeVod({ title: '파트2', weeklyAttendance: 'X' }),
    ]; // 같은 그룹 → 첫 번째(O) 기준
    const result = summarizeVods(vods);
    expect(result.done).toBe(1);
  });

  it('모두 출석이면 done === total', () => {
    const vods = [
      makeVod({ subject: '1주차', weeklyAttendance: 'O' }),
      makeVod({ subject: '2주차', weeklyAttendance: 'O' }),
    ];
    const result = summarizeVods(vods);
    expect(result.done).toBe(result.total);
  });

  it('모두 미출석이면 done === 0', () => {
    const vods = [
      makeVod({ subject: '1주차', weeklyAttendance: 'X' }),
      makeVod({ subject: '2주차', weeklyAttendance: 'X' }),
    ];
    const result = summarizeVods(vods);
    expect(result.done).toBe(0);
  });

  it('다른 courseId인 같은 subject+range는 별도 그룹', () => {
    const vods = [
      makeVod({ courseId: 'C1', subject: '1주차' }),
      makeVod({ courseId: 'C2', subject: '1주차' }),
    ];
    const result = summarizeVods(vods);
    expect(result.total).toBe(2);
  });

  it('같은 courseId+subject이지만 다른 range는 별도 그룹', () => {
    const vods = [
      makeVod({ range: '2024-01-01 ~ 2024-01-07' }),
      makeVod({ range: '2024-01-08 ~ 2024-01-14' }),
    ];
    const result = summarizeVods(vods);
    expect(result.total).toBe(2);
  });

  it('weeklyAttendance가 "o" (소문자)이면 isAttended → done 카운트', () => {
    const vods = [makeVod({ subject: '1주차', weeklyAttendance: 'o' })];
    const result = summarizeVods(vods);
    expect(result.done).toBe(1);
  });

  it('weeklyAttendance가 빈 문자열이면 미출석', () => {
    const vods = [makeVod({ subject: '1주차', weeklyAttendance: '' })];
    const result = summarizeVods(vods);
    expect(result.done).toBe(0);
  });

  it('단일 VOD 단일 그룹', () => {
    const vods = [makeVod()];
    const result = summarizeVods(vods);
    expect(result.total).toBe(1);
    expect(result.done).toBe(1);
  });
});
