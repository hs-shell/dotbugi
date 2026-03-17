import { CalendarEvent } from '@/lib/transformCalendarEvents';

export type GoogleCalendarEvent = {
  summary: string;
  description?: string;
  colorId?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
};

export type CalendarSyncResult = {
  added: number;
  failed: number;
  tokenExpired: boolean;
};

const EVENT_COLOR_MAP: Record<string, string> = {
  vod: '1', // 라벤더
  assign: '9', // 블루베리 (파랑)
  quiz: '6', // 귤 (주황)
};

export const getOAuthToken = async (interactive = false): Promise<string | null> => {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAuthToken', interactive });
    if (response?.token) {
      return response.token;
    }
    console.error('OAuth 토큰 획득 실패:', response?.error);
  } catch (e) {
    console.error('OAuth 메시지 전송 실패:', e);
  }
  return null;
};

export const removeCachedAuthToken = async (token: string): Promise<void> => {
  try {
    await chrome.runtime.sendMessage({ action: 'removeCachedAuthToken', token });
  } catch (e) {
    console.error('토큰 제거 메시지 전송 실패:', e);
  }
};

/**
 * 캘린더 API에 이벤트를 추가합니다.
 * 401 반환 시 tokenExpired를 true로 반환합니다.
 */
export async function addCalendarEvent(
  event: GoogleCalendarEvent,
  token: string,
): Promise<{ ok: boolean; tokenExpired: boolean }> {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (response.status === 401) {
      return { ok: false, tokenExpired: true };
    }
    if (!response.ok) {
      const errorBody = await response.json();
      console.error('이벤트 추가 실패:', response.status, errorBody);
      return { ok: false, tokenExpired: false };
    }
    return { ok: true, tokenExpired: false };
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return { ok: false, tokenExpired: false };
  }
}

const BATCH_CONCURRENCY = 2;
const BATCH_DELAY_MS = 500;

async function runBatch<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((item) => fn(item)));
    chunkResults.forEach((r, j) => { results[i + j] = r; });
    if (i + concurrency < items.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return results;
}

/**
 * 이벤트를 동시 5건씩 전송하고 실패한 건을 1회 재시도합니다.
 */
export async function addCalendarEventsBatch(
  events: GoogleCalendarEvent[],
  token: string,
): Promise<CalendarSyncResult> {
  const results = await runBatch(events, (event) => addCalendarEvent(event, token), BATCH_CONCURRENCY);

  let added = 0;
  const failed: GoogleCalendarEvent[] = [];
  let tokenExpired = false;

  results.forEach((result, i) => {
    if (result.tokenExpired) {
      tokenExpired = true;
    } else if (result.ok) {
      added++;
    } else {
      failed.push(events[i]);
    }
  });

  if (tokenExpired) {
    return { added, failed: events.length - added, tokenExpired: true };
  }

  // 실패한 건 1회 재시도
  if (failed.length > 0) {
    const retryResults = await runBatch(failed, (event) => addCalendarEvent(event, token), BATCH_CONCURRENCY);
    let retryFailed = 0;
    retryResults.forEach((result) => {
      if (result.ok) {
        added++;
      } else if (result.tokenExpired) {
        tokenExpired = true;
        retryFailed++;
      } else {
        retryFailed++;
      }
    });
    return { added, failed: retryFailed, tokenExpired };
  }

  return { added, failed: 0, tokenExpired: false };
}

/**
 * 구글 캘린더 API를 사용해 현재 이벤트 목록을 가져옵니다.
 */
export async function getCalendarEvents(
  token: string,
): Promise<{ events: GoogleCalendarEvent[]; tokenExpired: boolean }> {
  try {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 4);

    let allEvents: GoogleCalendarEvent[] = [];
    let pageToken: string | undefined;

    do {
      const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      url.searchParams.set('timeMin', pastDate.toISOString());
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('maxResults', '2500');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        return { events: [], tokenExpired: true };
      }

      const data = await response.json();
      allEvents = allEvents.concat(data.items || []);
      pageToken = data.nextPageToken;
    } while (pageToken);

    return { events: allEvents, tokenExpired: false };
  } catch (error) {
    console.error('캘린더 이벤트 가져오기 실패:', error);
    return { events: [], tokenExpired: false };
  }
}

/**
 * CalendarEvent 배열을 받아 GoogleCalendarEvent 배열로 변환합니다.
 */
export function convertCalendarEventsToGoogleEvents(events: CalendarEvent[]): GoogleCalendarEvent[] {
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
