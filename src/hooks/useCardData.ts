import { useState, useEffect } from 'react';
import { loadAndTransform } from '@/lib/storage';
import { Vod, Assign, Quiz } from '@/content/types';
import { makeVodGroupKey } from '@/utils/generate-key';
import { isAttended } from '@/lib/utils';

export type CardData = {
  done: number;
  total: number;
};

type Summaries = Record<'vod' | 'assign' | 'quiz', CardData>;

const DEFAULT_SUMMARY: CardData = { done: 0, total: 0 };

function useCardData() {
  const [summaries, setSummaries] = useState<Summaries>({
    vod: DEFAULT_SUMMARY,
    assign: DEFAULT_SUMMARY,
    quiz: DEFAULT_SUMMARY,
  });

  useEffect(() => {
    loadAndTransform<Vod, CardData>('vod', (vods) => {
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
        if (isAttended(vodItems[0].weeklyAttendance)) {
          done += 1;
        }
      });

      return { done, total: Object.keys(groupedData).length };
    }, (data) => setSummaries((prev) => ({ ...prev, vod: data })));

    loadAndTransform<Assign, CardData>('assign', (assigns) => {
      const done = assigns.filter((a) => a.isSubmit).length;
      return { done, total: assigns.length };
    }, (data) => setSummaries((prev) => ({ ...prev, assign: data })));

    loadAndTransform<Quiz, CardData>('quiz', (quizzes) => {
      // QuizData에 완료 여부 필드가 없어 항상 0
      return { done: 0, total: quizzes.length };
    }, (data) => setSummaries((prev) => ({ ...prev, quiz: data })));
  }, []);

  return summaries;
}

export default useCardData;
