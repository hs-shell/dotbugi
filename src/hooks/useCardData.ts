import { useState, useEffect } from 'react';
import { startOfDay } from 'date-fns';
import { loadDataFromStorage } from '@/lib/storage';
import { removeSquareBrackets } from '@/lib/utils';
import { Vod, Assign, Quiz } from '@/content/types';

export type CardData = {
  type: 'vod' | 'assign' | 'quiz';
  done: number;
  total: number;
};

function useCardData() {
  const [vodSummary, setVodSummary] = useState<CardData[]>([]);
  const [assignSummary, setAssignSummary] = useState<CardData[]>([]);
  const [quizSummary, setQuizSummary] = useState<CardData[]>([]);

  const loadEvents = <T>(
    storageKey: string,
    transform: (data: T[]) => CardData[],
    setter: (data: CardData[]) => void
  ) => {
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
      setter(eventsData);
    });
  };

  useEffect(() => {
    loadEvents<Vod>(
      'vod',
      (vods) => {
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

        let done = 0;
        Object.entries(groupedData).forEach(([_, vodItems]) => {
          if (vodItems[0].weeklyAttendance.toLowerCase() === 'o') {
            done += 1;
          }
        });

        return [
          {
            type: 'vod',
            done,
            total: Object.keys(groupedData).length,
          },
        ];
      },
      setVodSummary
    );

    loadEvents<Assign>(
      'assign',
      (assigns) => {
        const total = assigns.length;
        let done = 0;
        assigns.forEach((assign) => {
          if (assign.isSubmit) done += 1;
        });
        return [
          {
            type: 'assign',
            done,
            total,
          },
        ];
      },
      setAssignSummary
    );

    loadEvents<Quiz>(
      'quiz',
      (quizzes) => {
        const total = quizzes.length;
        let done = 0;
        // quiz에 대한 done 로직이 있다면 여기에 추가합니다.
        return [
          {
            type: 'quiz',
            done,
            total,
          },
        ];
      },
      setQuizSummary
    );
  }, []);

  return { vodSummary, assignSummary, quizSummary };
}

export default useCardData;
