import { afterEach, describe, expect, it, vi } from 'vitest';

import { isLmsUrl, openLmsUrl } from '@/lib/lmsUrl';

describe('isLmsUrl', () => {
  it('LMS 출처만 허용한다', () => {
    expect(isLmsUrl('https://learn.hansung.ac.kr/mod/vod/view.php?id=1')).toBe(true);
    expect(isLmsUrl('https://evil.com/mod/vod/view.php?id=1')).toBe(false);
    expect(isLmsUrl('https://learn.hansung.ac.kr.evil.com/')).toBe(false);
    expect(isLmsUrl('//evil.com/path')).toBe(false);
    expect(isLmsUrl('javascript:alert(1)')).toBe(false);
    expect(isLmsUrl('not a url')).toBe(false);
    expect(isLmsUrl('')).toBe(false);
    expect(isLmsUrl('http://learn.hansung.ac.kr/mod/vod/view.php?id=1')).toBe(false);
  });
});

describe('openLmsUrl', () => {
  afterEach(() => vi.restoreAllMocks());

  it('LMS URL 만 연다', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    openLmsUrl('https://evil.com/');
    expect(open).not.toHaveBeenCalled();
    openLmsUrl('https://learn.hansung.ac.kr/mod/assign/view.php?id=1');
    expect(open).toHaveBeenCalledWith('https://learn.hansung.ac.kr/mod/assign/view.php?id=1', '_blank', undefined);
  });

  it('features 를 넘기면 팝업 창 옵션을 그대로 전달', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    openLmsUrl('https://learn.hansung.ac.kr/mod/vod/viewer.php?id=1', '_blank', 'VodContentWindow');
    expect(open).toHaveBeenCalledWith(
      'https://learn.hansung.ac.kr/mod/vod/viewer.php?id=1',
      '_blank',
      'VodContentWindow'
    );
  });
});
