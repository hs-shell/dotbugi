import { useState, useEffect } from 'react';
import { startOfDay } from 'date-fns';
import { loadDataFromStorage } from '@/lib/storage';
import { removeSquareBrackets } from '@/lib/utils';
import { Vod, Assign, Quiz } from '@/content/types';

export type CalendarEvent = {
  id: string;
  type: 'vod' | 'assign' | 'quiz';
  title: string;
  subject: string;
  start: Date | null;
  end: Date | null;
};

function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = <T>(storageKey: string, transform: (data: T[]) => CalendarEvent[]) => {
    loadDataFromStorage(storageKey, (data: string | null) => {
      if (!data) return;

      let parsedData: T[];
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error(`JSON 파싱 에러 (${storageKey}):`, error);
          return;
        }
      } else {
        parsedData = data;
      }

      const eventsData = transform(parsedData);
      setEvents((prev) => [...prev, ...eventsData]);
    });
  };

  useEffect(() => {
    loadEvents<Vod>('vod', (vods) => {
      const groupedData = vods.reduce(
        (acc, item) => {
          const key = `${item.courseId}-${item.subject}-${item.range}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, Vod[]>
      );

      return Object.entries(groupedData).map(([key, vodItems]) => {
        const range = vodItems[0].range;
        const [start, end] = range ? range.split(' ~ ') : [null, null];
        return {
          id: key,
          type: 'vod',
          start: start ? new Date(start.replace(/-/g, '/')) : null,
          end: end ? new Date(end.replace(/-/g, '/')) : null,
          title: removeSquareBrackets(vodItems[0].courseTitle),
          subject: removeSquareBrackets(vodItems[0].subject),
        };
      });
    });

    // assign 데이터 로딩 및 변환
    loadEvents<Assign>('assign', (assigns) =>
      assigns.map((assign) => {
        const dueDate = assign.dueDate;
        const normalizedDate = dueDate ? startOfDay(new Date(dueDate)) : null;
        return {
          id: assign.courseId + assign.title + assign.dueDate,
          type: 'assign',
          start: normalizedDate,
          end: normalizedDate,
          title: removeSquareBrackets(assign.courseTitle),
          subject: removeSquareBrackets(assign.title),
        };
      })
    );

    // quiz 데이터 로딩 및 변환
    loadEvents<Quiz>('quiz', (quizzes) =>
      quizzes.map((quiz) => {
        const dueDate = quiz.dueDate;
        const normalizedDate = dueDate ? startOfDay(new Date(dueDate)) : null;
        return {
          id: quiz.courseId + quiz.title + quiz.dueDate,
          type: 'quiz',
          start: normalizedDate,
          end: normalizedDate,
          title: removeSquareBrackets(quiz.courseTitle),
          subject: removeSquareBrackets(quiz.title),
        };
      })
    );
  }, []);

  return events;
}

export default useCalendarEvents;
