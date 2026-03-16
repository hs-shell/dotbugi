import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { calendar_v3 } from 'googleapis';
import { useTranslation } from 'react-i18next';

type CalendarEvent = calendar_v3.Schema$Event;

const Labo: React.FC = () => {
  const { t } = useTranslation('option');
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
      .catch((error) => console.error('Calendar event fetch failed:', error));
  };

  useEffect(() => {
    chrome.identity.getAuthToken({ interactive: false }, (cachedToken) => {
      if (chrome.runtime.lastError || !cachedToken) {
        console.error('Auto login failed:', chrome.runtime.lastError?.message);
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
            console.error('Token revocation failed.');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  };

  const addCalendarEvent = () => {
    if (!token) return;

    const event = {
      summary: t('calendar.testEvent'),
      description: t('calendar.testEventDesc'),
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
        alert(t('calendar.eventAdded'));
        fetchCalendarEvents(token);
      })
      .catch((error) => console.error('Event add failed:', error));
  };

  return (
    <div className="px-4 pt-6 pb-20">
      <h1 className="text-xl font-bold mb-4">{t('calendar.googleSync')}</h1>
      {token ? (
        <div>
          <Button className="mt-4 mr-2" onClick={addCalendarEvent}>
            {t('calendar.addEvent')}
          </Button>
          <Button className="mt-4 bg-red-500 hover:bg-red-600" onClick={handleLogout}>
            {t('calendar.disconnect')}
          </Button>
          <h2 className="text-lg font-semibold mt-6">{t('calendar.mySchedule')}</h2>
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
              <p className="text-gray-500">{t('calendar.noEvents')}</p>
            )}
          </ul>
        </div>
      ) : (
        <Button onClick={handleLogin}>{t('calendar.connectGoogle')}</Button>
      )}
    </div>
  );
};

export default Labo;
