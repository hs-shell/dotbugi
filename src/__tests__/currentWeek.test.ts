import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { highlightCurrentWeek } from '@/lib/courseStatus/currentWeek';

const MONTH_NAMES: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
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

describe('highlightCurrentWeek', () => {
  const section = (id: number, name: string, dateLabel = '') => `
    <li id="section-${id}">
      ${dateLabel ? `<span class="text-ubstrap">${dateLabel}</span>` : ''}
      <div class="content"><h3 class="sectionname"><span>${name}</span></h3></div>
    </li>`;

  function render(sections: string, current = true) {
    document.body.innerHTML = `${current ? '<div class="course_box_current"></div>' : ''}<ul>${sections}</ul>`;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 20, 12, 0, 0));
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('오늘이 포함된 주차에만 표시를 달고, 이동 버튼을 누르면 그 주차로 스크롤한다', () => {
    render(section(1, '1주차 [3월11일 - 3월17일]') + section(2, '2주차 [3월18일 - 3월24일]'));
    highlightCurrentWeek();

    const markers = document.querySelectorAll('[data-dotbugi-current-week]');
    expect(markers).toHaveLength(1);
    expect(document.querySelector('#section-2 [data-dotbugi-current-week]')?.textContent).toBe(
      'courseStatus.currentWeek'
    );
    expect((document.querySelector('#section-2 .content') as HTMLElement).style.borderLeft).toContain('4px');

    const btn = document.getElementById('dotbugi-scroll-current-week')!;
    btn.click();
    expect(document.getElementById('section-2')!.scrollIntoView).toHaveBeenCalled();
  });

  it('다시 불러도 표시와 버튼을 중복해서 만들지 않는다', () => {
    render(section(2, '2주차 [3월18일 - 3월24일]'));
    highlightCurrentWeek();
    highlightCurrentWeek();

    expect(document.querySelectorAll('[data-dotbugi-current-week]')).toHaveLength(1);
    expect(document.querySelectorAll('#dotbugi-scroll-current-week')).toHaveLength(1);
  });

  it('주차의 연도 표기(YYYY-)로 날짜 범위를 판단한다', () => {
    // 섹션에 2025년이 적혀 있으면 2026년 3월 20일은 범위 밖이다
    render(section(2, '2주차 [3월18일 - 3월24일]', '2025-03-18'));
    highlightCurrentWeek();
    expect(document.querySelector('[data-dotbugi-current-week]')).toBeNull();
    expect(document.getElementById('dotbugi-scroll-current-week')).toBeNull();
  });

  it('현재 학기 강의가 아니면(.course_box_current 없음) 아무것도 하지 않는다', () => {
    render(section(2, '2주차 [3월18일 - 3월24일]'), false);
    highlightCurrentWeek();
    expect(document.querySelector('[data-dotbugi-current-week]')).toBeNull();
  });

  it('날짜 범위가 없는 섹션은 건너뛴다', () => {
    render(section(0, '일반') + section(1, '1주차'));
    highlightCurrentWeek();
    expect(document.querySelector('[data-dotbugi-current-week]')).toBeNull();
  });
});
