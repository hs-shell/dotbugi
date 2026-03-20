import { describe, it, expect } from 'vitest';
import { CalendarEvent } from '@/lib/transformCalendarEvents';

type GoogleCalendarEvent = {
  summary: string;
  colorId?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
};

const EVENT_COLOR_MAP: Record<string, string> = {
  vod: '1',
  assign: '9',
  quiz: '6',
};

function convertCalendarEventsToGoogleEvents(events: CalendarEvent[]): GoogleCalendarEvent[] {
  return events
    .filter((event) => event.start !== null && event.end !== null)
    .map((event) => ({
      summary: `${event.title} - ${event.subject}`,
      colorId: EVENT_COLOR_MAP[event.type],
      start: {
        dateTime: event.start!.toISOString(),
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: event.end!.toISOString(),
        timeZone: 'Asia/Seoul',
      },
    }));
}

describe('convertCalendarEventsToGoogleEvents', () => {
  it('CalendarEvent를 GoogleCalendarEvent로 변환', () => {
    const events: CalendarEvent[] = [
      {
        id: 'assign-1',
        title: '1주차 과제',
        subject: '프로그래밍',
        type: 'assign',
        start: new Date('2026-03-18T00:00:00'),
        end: new Date('2026-03-24T23:59:59'),
      },
    ];

    const result = convertCalendarEventsToGoogleEvents(events);
    expect(result).toHaveLength(1);
    expect(result[0].summary).toBe('1주차 과제 - 프로그래밍');
    expect(result[0].colorId).toBe('9');
    expect(result[0].start.timeZone).toBe('Asia/Seoul');
    expect(result[0].end.timeZone).toBe('Asia/Seoul');
  });

  it('type에 따른 colorId 매핑', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'VOD', subject: '과목', type: 'vod', start: new Date(), end: new Date() },
      { id: '2', title: '과제', subject: '과목', type: 'assign', start: new Date(), end: new Date() },
      { id: '3', title: '퀴즈', subject: '과목', type: 'quiz', start: new Date(), end: new Date() },
    ];

    const result = convertCalendarEventsToGoogleEvents(events);
    expect(result[0].colorId).toBe('1');
    expect(result[1].colorId).toBe('9');
    expect(result[2].colorId).toBe('6');
  });

  it('start 또는 end가 null인 이벤트 필터링', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'A', subject: '과목', type: 'vod', start: null, end: new Date() },
      { id: '2', title: 'B', subject: '과목', type: 'vod', start: new Date(), end: null },
      { id: '3', title: 'C', subject: '과목', type: 'vod', start: null, end: null },
      { id: '4', title: 'D', subject: '과목', type: 'vod', start: new Date(), end: new Date() },
    ];

    const result = convertCalendarEventsToGoogleEvents(events);
    expect(result).toHaveLength(1);
    expect(result[0].summary).toBe('D - 과목');
  });

  it('빈 배열 입력 시 빈 배열 반환', () => {
    expect(convertCalendarEventsToGoogleEvents([])).toEqual([]);
  });

  it('summary 형식이 "title - subject"', () => {
    const events: CalendarEvent[] = [
      { id: 'q1', title: '중간고사', subject: '자료구조', type: 'quiz', start: new Date(), end: new Date() },
    ];

    const result = convertCalendarEventsToGoogleEvents(events);
    expect(result[0].summary).toBe('중간고사 - 자료구조');
  });
});
