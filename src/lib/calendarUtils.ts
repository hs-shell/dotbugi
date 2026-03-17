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
 */
export async function addCalendarEvent(event: GoogleCalendarEvent, token: string): Promise<void> {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      const errorBody = await response.json();
      console.error('이벤트 추가 실패:', response.status, errorBody);
    }
  } catch (error) {
    console.error('Error adding calendar event:', error);
  }
}

/**
 * 구글 캘린더 API를 사용해 현재 이벤트 목록을 가져옵니다.
 */
export async function getCalendarEvents(token: string): Promise<GoogleCalendarEvent[]> {
  try {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 4);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${pastDate.toISOString()}&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('캘린더 이벤트 가져오기 실패:', error);
    return [];
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
