import { useState, useEffect } from 'react';
import { loadAndTransform } from '@/lib/storage';
import { Vod, Assign, Quiz } from '@/types';
import { CardData, summarizeVods } from '@/lib/summarizeCourseData';

export type { CardData };

type Summaries = Record<'vod' | 'assign' | 'quiz', CardData>;

const EMPTY: CardData = { done: 0, total: 0 };

function useCardData() {
  const [summaries, setSummaries] = useState<Summaries>({ vod: EMPTY, assign: EMPTY, quiz: EMPTY });
  const updateKey = (key: keyof Summaries) => (data: CardData) => {
    setSummaries((prev) => ({ ...prev, [key]: data }));
  };

  useEffect(() => {
    loadAndTransform<Vod, CardData>('vod', summarizeVods, updateKey('vod'));

    loadAndTransform<Assign, CardData>('assign', (assigns) => ({
      done: assigns.filter((a) => a.isSubmit).length,
      total: assigns.length,
    }), updateKey('assign'));

    // QuizData에 완료 여부 필드가 없어 done은 항상 0
    loadAndTransform<Quiz, CardData>('quiz', (quizzes) => ({
      done: 0,
      total: quizzes.length,
    }), updateKey('quiz'));
  }, []);

  return summaries;
}

export default useCardData;
