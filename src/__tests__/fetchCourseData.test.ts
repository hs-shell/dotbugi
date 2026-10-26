import { afterEach, describe, it, expect, vi } from 'vitest';
import { scrapeCourseData as scrapeLmsCourseData } from '@dotbugi/lms-parser';

import { scrapeCourseData } from '@/lib/fetchCourseData';
import { fetchHtml } from '@/lib/fetchHtml';
import { logger } from '@/lib/logger';

vi.mock('@dotbugi/lms-parser', () => ({ scrapeCourseData: vi.fn() }));

afterEach(() => {
  // 파서 mock 의 호출 기록·구현이 다음 테스트로 넘어가지 않게 (순서 무관)
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('scrapeCourseData 주입', () => {
  it('브라우저 fetchHtml·옵션을 넘기고, onError는 Error 메시지를 로깅', async () => {
    const warn = vi.spyOn(logger.course, 'warn').mockImplementation(() => {});
    const quizzes = [{ url: 'q1', isSubmit: true }] as never;

    await scrapeCourseData('123', quizzes, true);

    const [passedFetch, courseId, options] = vi.mocked(scrapeLmsCourseData).mock.calls[0];
    expect(passedFetch).toBe(fetchHtml);
    expect(courseId).toBe('123');
    expect(options).toMatchObject({ cachedQuizzes: quizzes, isCommunity: true });

    options!.onError!(new Error('boom'));
    options!.onError!('raw');
    expect(warn).toHaveBeenNthCalledWith(1, 'boom');
    expect(warn).toHaveBeenNthCalledWith(2, 'raw');
  });
});

describe('scrapeCourseData 중단', () => {
  it('signal 을 fetchHtml 에 넘기고, 중단되면 파서가 빈 값으로 끝내도 reject 한다', async () => {
    const controller = new AbortController();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'AbortError'));
    // 파서는 부분 실패를 빈 값으로 채워 resolve 한다 — 그대로 저장하면 기존 데이터가 지워진다
    vi.mocked(scrapeLmsCourseData).mockImplementation(async (passedFetch) => {
      controller.abort();
      await passedFetch('/course/view.php?id=1').catch(() => {});
      return { vodDataArray: [], vodAttendanceArray: [], assignDataArray: [], quizDataArray: [] } as never;
    });

    await expect(scrapeCourseData('1', undefined, false, controller.signal)).rejects.toThrow();
    expect(fetchSpy.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
});
