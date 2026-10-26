import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchHtml } from '@/lib/fetchHtml';

// 쿠키를 실어 요청하므로 LMS 출처만 허용하는지
describe('fetchHtml 출처 검사', () => {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => new Response('<p>ok</p>')
  );
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

  it('리다이렉트는 따라가지 않고 재시도 없이 실패한다', async () => {
    fetchMock.mockResolvedValueOnce({ type: 'opaqueredirect', status: 0, ok: false } as Response);
    await expect(fetchHtml('/course/view.php?id=1')).rejects.toThrow('HTTP 3xx');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: 'manual', credentials: 'include' });
  });
});

describe('fetchHtml 재시도', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('네트워크 오류는 최대 2회 다시 시도하고, 성공하면 파싱한 문서를 돌려준다', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response('<p id="x">ok</p>'));
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchHtml('/course/view.php?id=1');
    await vi.runAllTimersAsync();
    const doc = await promise;

    expect(doc.getElementById('x')?.textContent).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('세 번 모두 실패하면 마지막 오류를 던진다', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchHtml('/course/view.php?id=1');
    const assertion = expect(promise).rejects.toThrow('Failed to fetch');
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('HTTP 오류 응답은 재시도하지 않는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchHtml('/course/view.php?id=1')).rejects.toThrow('HTTP 503');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('중단된 요청은 재시도하지 않는다', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchHtml('/course/view.php?id=1', controller.signal)).rejects.toThrow('aborted');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
