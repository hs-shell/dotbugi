import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { CalendarEvent } from '@/lib/transformCalendarEvents';
import {
  addCalendarEvent,
  addCalendarEventsBatch,
  convertCalendarEventsToGoogleEvents,
  getCalendarEvents,
  getOAuthToken,
  removeCachedAuthToken,
  type GoogleCalendarEvent,
} from '@/lib/calendarUtils';

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

const makeEvent = (summary: string): GoogleCalendarEvent => ({
  summary,
  start: { dateTime: '2026-03-18T00:00:00.000Z', timeZone: 'Asia/Seoul' },
  end: { dateTime: '2026-03-18T01:00:00.000Z', timeZone: 'Asia/Seoul' },
});

const jsonResponse = (status: number, body: unknown = {}) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as Response;

describe('getOAuthToken / removeCachedAuthToken', () => {
  const sendMessage = vi.fn();

  beforeEach(() => {
    sendMessage.mockReset();
    vi.stubGlobal('chrome', { runtime: { sendMessage } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('background 응답에 토큰이 있으면 그 토큰을 돌려준다', async () => {
    sendMessage.mockResolvedValue({ token: 'tok' });
    await expect(getOAuthToken(true)).resolves.toBe('tok');
    expect(sendMessage).toHaveBeenCalledWith({ action: 'getAuthToken', interactive: true });
  });

  it('토큰이 없거나 메시지 전송이 실패하면 null', async () => {
    sendMessage.mockResolvedValueOnce({ error: 'no' });
    await expect(getOAuthToken()).resolves.toBeNull();
    sendMessage.mockRejectedValueOnce(new Error('port closed'));
    await expect(getOAuthToken(true)).resolves.toBeNull();
  });

  it('캐시된 토큰 제거를 background 에 요청하고, 실패해도 예외를 던지지 않는다', async () => {
    sendMessage.mockResolvedValueOnce(undefined);
    await removeCachedAuthToken('tok');
    expect(sendMessage).toHaveBeenCalledWith({ action: 'removeCachedAuthToken', token: 'tok' });
    sendMessage.mockRejectedValueOnce(new Error('x'));
    await expect(removeCachedAuthToken('tok')).resolves.toBeUndefined();
  });
});

describe('addCalendarEvent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Bearer 토큰과 JSON 본문으로 primary 캘린더에 POST 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    vi.stubGlobal('fetch', fetchMock);
    const event = makeEvent('A');

    await expect(addCalendarEvent(event, 'tok')).resolves.toEqual({ ok: true, tokenExpired: false });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toEqual(event);
  });

  it('401 이면 토큰 만료로 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401)));
    await expect(addCalendarEvent(makeEvent('A'), 'tok')).resolves.toEqual({ ok: false, tokenExpired: true });
  });

  it('그 밖의 실패 응답·네트워크 오류는 만료가 아닌 실패', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(500, { error: 'x' })));
    await expect(addCalendarEvent(makeEvent('A'), 'tok')).resolves.toEqual({ ok: false, tokenExpired: false });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    await expect(addCalendarEvent(makeEvent('A'), 'tok')).resolves.toEqual({ ok: false, tokenExpired: false });
  });
});

describe('addCalendarEventsBatch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** summary 별로 응답 상태를 차례로 돌려주는 fetch */
  function stubFetchBySummary(statuses: Record<string, number[]>) {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const { summary } = JSON.parse(init.body as string);
      return jsonResponse(statuses[summary].shift() ?? 200);
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('모두 성공하면 추가 건수만 센다', async () => {
    const fetchMock = stubFetchBySummary({ A: [200], B: [200], C: [200] });
    const promise = addCalendarEventsBatch([makeEvent('A'), makeEvent('B'), makeEvent('C')], 'tok');
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ added: 3, failed: 0, tokenExpired: false });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('실패한 이벤트만 1회 재시도하고, 재시도에서도 실패한 건을 failed 로 센다', async () => {
    const fetchMock = stubFetchBySummary({ A: [500, 200], B: [200], C: [500, 500] });
    const promise = addCalendarEventsBatch([makeEvent('A'), makeEvent('B'), makeEvent('C')], 'tok');
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ added: 2, failed: 1, tokenExpired: false });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('첫 전송에서 토큰이 만료되면 재시도 없이 나머지를 실패로 돌려준다', async () => {
    const fetchMock = stubFetchBySummary({ A: [200], B: [401], C: [500] });
    const promise = addCalendarEventsBatch([makeEvent('A'), makeEvent('B'), makeEvent('C')], 'tok');
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ added: 1, failed: 2, tokenExpired: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('재시도 중 토큰이 만료되면 tokenExpired 를 알린다', async () => {
    stubFetchBySummary({ A: [500, 401] });
    const promise = addCalendarEventsBatch([makeEvent('A')], 'tok');
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ added: 0, failed: 1, tokenExpired: true });
  });
});

describe('getCalendarEvents', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('nextPageToken 을 따라 모든 페이지의 이벤트를 모은다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { items: [makeEvent('A')], nextPageToken: 'p2' }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [makeEvent('B')] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getCalendarEvents('tok');
    expect(result.tokenExpired).toBe(false);
    expect(result.events.map((e) => e.summary)).toEqual(['A', 'B']);
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.has('pageToken')).toBe(false);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('pageToken')).toBe('p2');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
  });

  it('items 가 없는 응답은 빈 목록으로 본다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {})));
    await expect(getCalendarEvents('tok')).resolves.toEqual({ events: [], tokenExpired: false });
  });

  it('401 이면 토큰 만료, 네트워크 오류면 빈 목록', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401)));
    await expect(getCalendarEvents('tok')).resolves.toEqual({ events: [], tokenExpired: true });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    await expect(getCalendarEvents('tok')).resolves.toEqual({ events: [], tokenExpired: false });
  });
});
