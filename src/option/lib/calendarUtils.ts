import { CalendarEvent } from '@/hooks/useCalendarEvents';

export type GoogleCalendarEvent = {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
};

export const getOAuthToken = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (cachedToken) => {
      if (chrome.runtime.lastError || !cachedToken) {
        console.error('자동 로그인 실패:', chrome.runtime.lastError?.message);
        resolve(null);
      } else {
        resolve(cachedToken);
      }
    });
  });
};

/**
 * 캘린더 API에 이벤트를 추가합니다.
 * @param event 캘린더에 추가할 이벤트 객체
 * @param token OAuth 토큰
 */
export async function addCalendarEvent(event: GoogleCalendarEvent, token: string): Promise<void> {
  try {
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then(() => {})
      .catch((error) => console.error('이벤트 추가 실패:', error));
  } catch (error) {
    console.error('Error adding calendar event:', error);
  }
}

/**
 * 구글 캘린더 API를 사용해 현재 이벤트 목록을 가져옵니다.
 * @param token OAuth 토큰
 * @returns CalendarEvent 배열
 */
export async function getCalendarEvents(token: string): Promise<GoogleCalendarEvent[]> {
  try {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 3);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${pastDate.toISOString()}&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
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
 * 여기서는 title과 subject를 summary로 조합하는 예시입니다.
 * @param events CalendarEvent 배열
 * @returns GoogleCalendarEvent 배열
 */
export function convertCalendarEventsToGoogleEvents(events: CalendarEvent[]): GoogleCalendarEvent[] {
  return events
    .filter((event) => event.start !== null && event.end !== null)
    .map((event) => ({
      summary: `${event.title}`,
      description: `${event.subject}`,
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
