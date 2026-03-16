import { useState, useEffect } from 'react';
import { loadAndTransform } from '@/lib/storage';
import { Vod, Assign, Quiz } from '@/types';
import { CalendarEvent, vodGroupsToEvents, dueDateItemToEvent } from '@/option/lib/transformCalendarEvents';

export type { CalendarEvent };

function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const appendEvents = (newEvents: CalendarEvent[]) => {
      setEvents((prev) => [...prev, ...newEvents]);
    };

    loadAndTransform<Vod, CalendarEvent[]>('vod', vodGroupsToEvents, appendEvents);

    loadAndTransform<Assign, CalendarEvent[]>(
      'assign',
      (assigns) => assigns.map((a) => dueDateItemToEvent(a, 'assign')),
      appendEvents,
    );

    loadAndTransform<Quiz, CalendarEvent[]>(
      'quiz',
      (quizzes) => quizzes.map((q) => dueDateItemToEvent(q, 'quiz')),
      appendEvents,
    );
  }, []);

  return events;
}

export default useCalendarEvents;
