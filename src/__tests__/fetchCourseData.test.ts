import { afterEach, describe, it, expect, vi } from 'vitest';
import { scrapeCourseData as scrapeLmsCourseData } from '@dotbugi/lms-parser';

import { scrapeCourseData } from '@/lib/fetchCourseData';
import { fetchHtml } from '@/lib/fetchHtml';
import { logger } from '@/lib/logger';

vi.mock('@dotbugi/lms-parser', () => ({ scrapeCourseData: vi.fn() }));

afterEach(() => {
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
