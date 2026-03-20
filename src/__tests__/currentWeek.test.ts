import { describe, it, expect } from 'vitest';

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseLocalizedDate(str: string, year: number): Date | null {
  let m: RegExpMatchArray | null;

  m = str.match(/(\d{1,2})월\s*(\d{1,2})일/) ?? str.match(/(\d{1,2})月(\d{1,2})日/);
  if (m) return new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));

  m = str.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) return new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));

  m = str.match(/(\d{1,2})\s+([A-Za-z]+)/);
  if (m && MONTH_NAMES[m[2].toLowerCase()]) {
    return new Date(year, MONTH_NAMES[m[2].toLowerCase()] - 1, parseInt(m[1]));
  }

  return null;
}

function parseSectionDateRange(text: string, year: number): { start: Date; end: Date } | null {
  const match = text.match(/\[([^\]]+)\]/);
  if (!match) return null;

  const [startStr, endStr] = match[1].split(/\s*-\s*/);
  if (!startStr || !endStr) return null;

  const start = parseLocalizedDate(startStr.trim(), year);
  const end = parseLocalizedDate(endStr.trim(), year);
  if (!start || !end) return null;

  end.setHours(23, 59, 59);
  return { start, end };
}

describe('parseLocalizedDate', () => {
  const year = 2026;

  describe('한국어 (월일)', () => {
    it('3월18일', () => {
      const result = parseLocalizedDate('3월18일', year);
      expect(result).toEqual(new Date(2026, 2, 18));
    });

    it('12월 1일 (공백 포함)', () => {
      const result = parseLocalizedDate('12월 1일', year);
      expect(result).toEqual(new Date(2026, 11, 1));
    });
  });

  describe('중국어 (月日)', () => {
    it('03月04日', () => {
      const result = parseLocalizedDate('03月04日', year);
      expect(result).toEqual(new Date(2026, 2, 4));
    });

    it('12月31日', () => {
      const result = parseLocalizedDate('12月31日', year);
      expect(result).toEqual(new Date(2026, 11, 31));
    });
  });

  describe('일본어 (MM/DD)', () => {
    it('03/04', () => {
      const result = parseLocalizedDate('03/04', year);
      expect(result).toEqual(new Date(2026, 2, 4));
    });

    it('1/1', () => {
      const result = parseLocalizedDate('1/1', year);
      expect(result).toEqual(new Date(2026, 0, 1));
    });
  });

  describe('영어 (DD Month)', () => {
    it('04 March', () => {
      const result = parseLocalizedDate('04 March', year);
      expect(result).toEqual(new Date(2026, 2, 4));
    });

    it('25 December', () => {
      const result = parseLocalizedDate('25 December', year);
      expect(result).toEqual(new Date(2026, 11, 25));
    });

    it('대소문자 무시', () => {
      const result = parseLocalizedDate('1 january', year);
      expect(result).toEqual(new Date(2026, 0, 1));
    });
  });

  describe('잘못된 형식', () => {
    it('빈 문자열', () => {
      expect(parseLocalizedDate('', year)).toBeNull();
    });

    it('인식 불가 형식', () => {
      expect(parseLocalizedDate('2026-03-18', year)).toBeNull();
    });

    it('잘못된 영어 월 이름', () => {
      expect(parseLocalizedDate('04 Smarch', year)).toBeNull();
    });
  });
});

describe('parseSectionDateRange', () => {
  const year = 2026;

  it('한국어 범위 파싱', () => {
    const result = parseSectionDateRange('1주차 [3월18일 - 3월24일]', year);
    expect(result).not.toBeNull();
    expect(result!.start).toEqual(new Date(2026, 2, 18));
    expect(result!.end.getMonth()).toBe(2);
    expect(result!.end.getDate()).toBe(24);
    expect(result!.end.getHours()).toBe(23);
  });

  it('영어 범위 파싱', () => {
    const result = parseSectionDateRange('Week 1 [18 March - 24 March]', year);
    expect(result).not.toBeNull();
    expect(result!.start).toEqual(new Date(2026, 2, 18));
    expect(result!.end.getDate()).toBe(24);
  });

  it('일본어 범위 파싱', () => {
    const result = parseSectionDateRange('第1週 [03/18 - 03/24]', year);
    expect(result).not.toBeNull();
    expect(result!.start).toEqual(new Date(2026, 2, 18));
  });

  it('중국어 범위 파싱', () => {
    const result = parseSectionDateRange('第1周 [03月18日 - 03月24日]', year);
    expect(result).not.toBeNull();
    expect(result!.start).toEqual(new Date(2026, 2, 18));
  });

  it('대괄호 없으면 null', () => {
    expect(parseSectionDateRange('1주차 3월18일', year)).toBeNull();
  });

  it('하이픈 없으면 null', () => {
    expect(parseSectionDateRange('[3월18일]', year)).toBeNull();
  });

  it('end 날짜가 23:59:59로 설정됨', () => {
    const result = parseSectionDateRange('[3월18일 - 3월24일]', year);
    expect(result!.end.getHours()).toBe(23);
    expect(result!.end.getMinutes()).toBe(59);
    expect(result!.end.getSeconds()).toBe(59);
  });
});
