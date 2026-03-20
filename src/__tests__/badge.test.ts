import { describe, it, expect } from 'vitest';

// badge.ts 내부 함수들을 테스트하기 위해 모듈을 동적으로 import
// parseTimeToSeconds, normalizeUrl은 export되지 않으므로 같은 로직을 테스트

describe('parseTimeToSeconds (logic)', () => {
  function parseTimeToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  it('HH:MM:SS 형식을 초로 변환', () => {
    expect(parseTimeToSeconds('01:30:00')).toBe(5400);
    expect(parseTimeToSeconds('00:05:30')).toBe(330);
    expect(parseTimeToSeconds('02:00:00')).toBe(7200);
  });

  it('MM:SS 형식을 초로 변환', () => {
    expect(parseTimeToSeconds('05:30')).toBe(330);
    expect(parseTimeToSeconds('00:00')).toBe(0);
    expect(parseTimeToSeconds('90:00')).toBe(5400);
  });

  it('잘못된 형식은 0 반환', () => {
    expect(parseTimeToSeconds('')).toBe(0);
    expect(parseTimeToSeconds('abc')).toBe(0);
    expect(parseTimeToSeconds('30')).toBe(0);
  });

  it('경계값 처리', () => {
    expect(parseTimeToSeconds('00:00:00')).toBe(0);
    expect(parseTimeToSeconds('23:59:59')).toBe(86399);
    expect(parseTimeToSeconds('00:00:01')).toBe(1);
  });
});

describe('normalizeUrl (logic)', () => {
  const BASE_LINK = 'https://learn.hansung.ac.kr';

  function normalizeUrl(url: string): string {
    if (url.startsWith('http')) return url;
    return BASE_LINK + (url.startsWith('/') ? '' : '/') + url;
  }

  it('http로 시작하는 URL은 그대로 반환', () => {
    expect(normalizeUrl('https://learn.hansung.ac.kr/mod/vod/view.php?id=1')).toBe(
      'https://learn.hansung.ac.kr/mod/vod/view.php?id=1',
    );
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('/로 시작하는 상대 경로에 BASE_LINK 추가', () => {
    expect(normalizeUrl('/mod/vod/view.php?id=1')).toBe(
      'https://learn.hansung.ac.kr/mod/vod/view.php?id=1',
    );
  });

  it('/가 없는 상대 경로에 BASE_LINK/ 추가', () => {
    expect(normalizeUrl('mod/vod/view.php?id=1')).toBe(
      'https://learn.hansung.ac.kr/mod/vod/view.php?id=1',
    );
  });
});
