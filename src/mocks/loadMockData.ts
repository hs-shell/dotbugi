import { Vod, Assign, Quiz } from '@/types';

export type MockData = {
  vods: Vod[];
  assigns: Assign[];
  quizzes: Quiz[];
};

export async function loadMockData(): Promise<MockData> {
  const { mockVods, mockAssigns, mockQuizes } = await import('./mockData');
  return { vods: mockVods, assigns: mockAssigns, quizzes: mockQuizes };
}
