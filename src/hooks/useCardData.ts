import { useState, useEffect } from 'react';
import { loadAndTransform } from '@/lib/storage';
import { Vod, Assign, Quiz } from '@/content/types';
import { makeVodGroupKey } from '@/utils/generate-key';

export type CardData = {
  type: 'vod' | 'assign' | 'quiz';
  done: number;
  total: number;
};

function useCardData() {
  const [vodSummary, setVodSummary] = useState<CardData[]>([]);
  const [assignSummary, setAssignSummary] = useState<CardData[]>([]);
  const [quizSummary, setQuizSummary] = useState<CardData[]>([]);

  useEffect(() => {
    loadAndTransform<Vod, CardData[]>('vod', (vods) => {
      const groupedData = vods.reduce(
        (acc, item) => {
          const key = makeVodGroupKey(item.courseId, item.subject, item.range);
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, Vod[]>
      );

      let done = 0;
      Object.values(groupedData).forEach((vodItems) => {
        if (vodItems[0].weeklyAttendance.toLowerCase() === 'o') {
          done += 1;
        }
      });

      return [{ type: 'vod', done, total: Object.keys(groupedData).length }];
    }, setVodSummary);

    loadAndTransform<Assign, CardData[]>('assign', (assigns) => {
      const done = assigns.filter((a) => a.isSubmit).length;
      return [{ type: 'assign', done, total: assigns.length }];
    }, setAssignSummary);

    loadAndTransform<Quiz, CardData[]>('quiz', (quizzes) => {
      // QuizData에 완료 여부 필드가 없어 항상 0
      return [{ type: 'quiz', done: 0, total: quizzes.length }];
    }, setQuizSummary);
  }, []);

  return { vodSummary, assignSummary, quizSummary };
}

export default useCardData;
