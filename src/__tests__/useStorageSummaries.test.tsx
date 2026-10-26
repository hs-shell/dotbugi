import { beforeEach, describe, expect, it, vi } from 'vitest';

import useCalendarEvents from '@/hooks/useCalendarEvents';
import useCardData from '@/hooks/useCardData';
import { renderHook, stubChromeStorage } from './renderHook';

const store: Record<string, unknown> = {};

const vod = (subject: string, weeklyAttendance: string) => ({
  courseId: '1',
  courseTitle: '자료구조[01]',
  subject,
  range: '2026-03-02 00:00:00 ~ 2026-03-08 23:59:00',
  weeklyAttendance,
});

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal('chrome', stubChromeStorage(store).chromeStub);
});

describe('useCardData', () => {
  it('주차별 VOD 출석, 과제 제출 수, 퀴즈 수를 요약한다', async () => {
    store.vod = [vod('1주차', 'O'), vod('1주차', 'O'), vod('2주차', 'X')];
    // 예전 버전은 JSON 문자열로 저장했다
    store.assign = JSON.stringify([{ isSubmit: true }, { isSubmit: false }]);
    store.quiz = [{}, {}, {}];

    const { result } = await renderHook(useCardData, undefined);
    expect(result.current).toEqual({
      vod: { done: 1, total: 2 },
      assign: { done: 1, total: 2 },
      quiz: { done: 0, total: 3 },
    });
  });

  it('저장된 데이터가 없으면 0 으로 둔다', async () => {
    const { result } = await renderHook(useCardData, undefined);
    expect(result.current.vod).toEqual({ done: 0, total: 0 });
  });
});

describe('useCalendarEvents', () => {
  it('VOD 주차·과제·퀴즈를 캘린더 이벤트로 모은다', async () => {
    store.vod = [vod('1주차', 'O'), vod('1주차', 'O')];
    store.assign = [{ courseId: '1', courseTitle: '자료구조', title: '과제', dueDate: '2026-03-10 23:59' }];
    store.quiz = [{ courseId: '1', courseTitle: '자료구조', title: '퀴즈', dueDate: null }];

    const { result } = await renderHook(useCalendarEvents, undefined);
    expect(result.current.map((e) => [e.type, e.title, e.subject])).toEqual([
      ['vod', '자료구조', '1주차'],
      ['assign', '자료구조', '과제'],
      ['quiz', '자료구조', '퀴즈'],
    ]);
    expect(result.current[0].start).toEqual(new Date(2026, 2, 2));
    expect(result.current[2].start).toBeNull();
  });
});
