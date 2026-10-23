import { afterEach, describe, expect, it, vi } from 'vitest';

import { isLmsUrl, openLmsUrl, urlOriginForLog } from '@/lib/lmsUrl';
import { logger } from '@/lib/logger';

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

describe('urlOriginForLog', () => {
  it('쿼리·경로 없이 출처만 돌려준다', () => {
    expect(urlOriginForLog('https://evil.com/path?token=secret')).toBe('https://evil.com');
    expect(urlOriginForLog('not a url')).toBe('(잘못된 URL)');
    expect(urlOriginForLog(undefined)).toBe('(잘못된 URL)');
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

  it('LMS 출처가 아니면 막고 출처만 경고로 남긴다', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const warn = vi.spyOn(logger.general, 'warn').mockImplementation(() => {});
    openLmsUrl('https://evil.com/path?token=secret');
    expect(warn).toHaveBeenCalledWith(expect.any(String), 'https://evil.com');
    warn.mockClear();
    openLmsUrl('https://learn.hansung.ac.kr/mod/assign/view.php?id=1');
    expect(warn).not.toHaveBeenCalled();
  });
});
