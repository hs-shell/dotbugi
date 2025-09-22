import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { calendar_v3 } from 'googleapis';

type CalendarEvent = calendar_v3.Schema$Event;

const Labo: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const fetchCalendarEvents = (token: string) => {
    fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' +
        new Date().toISOString() +
        '&orderBy=startTime&singleEvents=true',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => setEvents(data.items || []))
      .catch((error) => console.error('캘린더 이벤트 가져오기 실패:', error));
  };

  useEffect(() => {
    chrome.identity.getAuthToken({ interactive: false }, (cachedToken) => {
      if (chrome.runtime.lastError || !cachedToken) {
        console.error('자동 로그인 실패:', chrome.runtime.lastError?.message);
      } else {
        setToken(cachedToken);
        fetchCalendarEvents(cachedToken);
      }
    });
  }, []);

  const handleLogin = () => {
    chrome.identity.getAuthToken({ interactive: true }, (newToken) => {
      if (chrome.runtime.lastError || !newToken) {
        console.error(chrome.runtime.lastError);
        return;
      }
      setToken(newToken);
      fetchCalendarEvents(newToken);
    });
  };

  const handleLogout = () => {
    if (!token) return;

    chrome.identity.removeCachedAuthToken({ token }, () => {
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        },
      })
        .then((response) => {
          if (response.ok) {
            setToken(null);
            setEvents([]);
          } else {
            console.error('토큰 폐기 요청에 실패했습니다.');
          }
        })
        .catch((error) => {
          console.error('에러 발생:', error);
        });
    });
  };

  const addCalendarEvent = () => {
    if (!token) return;

    const event = {
      summary: '테스트 이벤트 🎉',
      description: '이것은 Google Calendar API를 사용한 이벤트 생성입니다.',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'Asia/Seoul',
      },
    };

    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then(() => {
        alert('새로운 이벤트가 추가되었습니다!');
        fetchCalendarEvents(token);
      })
      .catch((error) => console.error('이벤트 추가 실패:', error));
  };

  return (
    <div className="px-4 pt-6 pb-20">
      <h1 className="text-xl font-bold mb-4">Google Calendar 연동</h1>
      {token ? (
        <div>
          <Button className="mt-4 mr-2" onClick={addCalendarEvent}>
            새 이벤트 추가
          </Button>
          <Button className="mt-4 bg-red-500 hover:bg-red-600" onClick={handleLogout}>
            연동 해제
          </Button>
          <h2 className="text-lg font-semibold mt-6">내 캘린더 일정</h2>
          <ul className="mt-2">
            {events.length > 0 ? (
              events.map((event, index) => (
                <li key={index} className="mt-2 p-2 border rounded-lg bg-gray-100">
                  <strong>{event.summary}</strong>
                  <p>
                    {event.start?.dateTime?.replace('T', ' ').substring(0, 16)} ~{' '}
                    {event.end?.dateTime?.replace('T', ' ').substring(0, 16)}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-gray-500">일정이 없습니다.</p>
            )}
          </ul>
        </div>
      ) : (
        <Button onClick={handleLogin}>Google 계정 연동</Button>
      )}
    </div>
  );
};

export default Labo;
