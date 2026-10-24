import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchHtml } from '@/lib/fetchHtml';

// 쿠키를 실어 요청하므로 LMS 출처만 허용하는지
describe('fetchHtml 출처 검사', () => {
  const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () => new Response('<p>ok</p>'));
  vi.stubGlobal('fetch', fetchMock);

  afterEach(() => fetchMock.mockClear());

  it('LMS 절대·상대 주소는 LMS 출처로 요청한다', async () => {
    await fetchHtml('https://learn.hansung.ac.kr/course/view.php?id=1');
    await fetchHtml('/mod/vod/index.php?id=1');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://learn.hansung.ac.kr/course/view.php?id=1',
      'https://learn.hansung.ac.kr/mod/vod/index.php?id=1',
    ]);
  });

  it.each(['https://evil.example/x', '//evil.example/x', 'https://learn.hansung.ac.kr.evil.example/', 'javascript:1'])(
    '외부 주소 %s 는 요청하지 않는다',
    async (link) => {
      await expect(fetchHtml(link)).rejects.toThrow('LMS 출처가 아닌');
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );
});
