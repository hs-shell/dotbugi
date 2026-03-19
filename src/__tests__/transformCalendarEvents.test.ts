import { describe, it, expect } from 'vitest';
import { vodGroupsToEvents, dueDateItemToEvent } from '@/lib/transformCalendarEvents';
import { Vod } from '@/types';

const makeVod = (overrides: Partial<Vod> = {}): Vod => ({
  courseId: 'C1',
  courseTitle: '[A반] 프로그래밍',
  prof: '김교수',
  week: 1,
  subject: '[1주차] 개론',
  title: '강의1',
  url: '/v1',
  range: '2024-01-01 09:00 ~ 2024-01-07 23:59',
  length: '30:00',
  isAttendance: 'O',
  weeklyAttendance: 'O',
  ...overrides,
});

describe('vodGroupsToEvents', () => {
  it('같은 courseId+subject+range는 하나의 이벤트로 그룹핑', () => {
    const vods = [
      makeVod({ title: '파트1' }),
      makeVod({ title: '파트2' }),
    ];
    const events = vodGroupsToEvents(vods);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('vod');
  });

  it('다른 subject면 별도 이벤트', () => {
    const vods = [
      makeVod({ subject: '1주차' }),
      makeVod({ subject: '2주차' }),
    ];
    const events = vodGroupsToEvents(vods);
    expect(events).toHaveLength(2);
  });

  it('range에서 시작/종료 날짜 파싱', () => {
    const events = vodGroupsToEvents([makeVod()]);
    expect(events[0].start).toBeInstanceOf(Date);
    expect(events[0].end).toBeInstanceOf(Date);
  });

  it('range가 null이면 start/end도 null', () => {
    const events = vodGroupsToEvents([makeVod({ range: null })]);
    expect(events[0].start).toBeNull();
    expect(events[0].end).toBeNull();
  });

  it('대괄호가 title/subject에서 제거됨', () => {
    const events = vodGroupsToEvents([makeVod()]);
    expect(events[0].title).not.toContain('[');
    expect(events[0].subject).not.toContain('[');
  });

  it('빈 배열이면 빈 이벤트 배열', () => {
    expect(vodGroupsToEvents([])).toEqual([]);
  });

  it('다른 courseId면 같은 subject+range여도 별도 이벤트', () => {
    const vods = [
      makeVod({ courseId: 'C1' }),
      makeVod({ courseId: 'C2' }),
    ];
    const events = vodGroupsToEvents(vods);
    expect(events).toHaveLength(2);
  });

  it('같은 courseId+subject이지만 다른 range면 별도 이벤트', () => {
    const vods = [
      makeVod({ range: '2024-01-01 09:00 ~ 2024-01-07 23:59' }),
      makeVod({ range: '2024-01-08 09:00 ~ 2024-01-14 23:59' }),
    ];
    const events = vodGroupsToEvents(vods);
    expect(events).toHaveLength(2);
  });

  it('그룹의 첫 번째 VOD 기준으로 title/subject 설정', () => {
    const vods = [
      makeVod({ courseTitle: '[A반] 수학', subject: '[1주차] 개론', title: '파트1' }),
      makeVod({ courseTitle: '[B반] 수학', subject: '[2주차] 심화', title: '파트2' }),
    ];
    // 같은 courseId+subject+range이면 하나로 묶이므로, 다른 subject면 별도
    const events = vodGroupsToEvents(vods);
    expect(events).toHaveLength(2);
  });
});

describe('dueDateItemToEvent', () => {
  it('assign 타입 이벤트 생성', () => {
    const item = { courseId: 'C1', courseTitle: '[A반] 수학', title: '과제1', dueDate: '2024-06-30' };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.type).toBe('assign');
    expect(event.start).toBeInstanceOf(Date);
    expect(event.title).toBe(' 수학');
  });

  it('quiz 타입 이벤트 생성', () => {
    const item = { courseId: 'C1', courseTitle: '영어', title: '퀴즈1', dueDate: '2024-06-30' };
    const event = dueDateItemToEvent(item, 'quiz');
    expect(event.type).toBe('quiz');
  });

  it('dueDate가 null이면 start/end null', () => {
    const item = { courseId: 'C1', courseTitle: '수학', title: '과제1', dueDate: null };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.start).toBeNull();
    expect(event.end).toBeNull();
  });

  it('id는 courseId+title+dueDate 조합', () => {
    const item = { courseId: 'C1', courseTitle: '수학', title: '과제1', dueDate: '2024-06-30' };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.id).toBe('C1과제12024-06-30');
  });

  it('dueDate가 startOfDay로 정규화됨', () => {
    const item = { courseId: 'C1', courseTitle: '수학', title: '과제1', dueDate: '2024-06-30 15:30:00' };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.start!.getHours()).toBe(0);
    expect(event.start!.getMinutes()).toBe(0);
  });

  it('start와 end가 동일한 Date 값', () => {
    const item = { courseId: 'C1', courseTitle: '수학', title: '과제1', dueDate: '2024-06-30' };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.start!.getTime()).toBe(event.end!.getTime());
  });

  it('subject는 item의 title에서 대괄호 제거한 값', () => {
    const item = { courseId: 'C1', courseTitle: '수학', title: '[3주차] 리포트', dueDate: '2024-06-30' };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.subject).toBe(' 리포트');
  });

  it('dueDate null일 때 id에 null 문자열 포함', () => {
    const item = { courseId: 'C1', courseTitle: '수학', title: '과제1', dueDate: null };
    const event = dueDateItemToEvent(item, 'assign');
    expect(event.id).toBe('C1과제1null');
  });
});
