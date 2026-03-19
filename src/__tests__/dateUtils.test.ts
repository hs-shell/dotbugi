import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseDate,
  isCurrentDateInRange,
  isCurrentDateByDate,
  isWithinSevenDays,
  extractEndDate,
  calculateDueDate,
  calculateRemainingTime,
  timeAgo,
} from '@/lib/dateUtils';

describe('parseDate', () => {
  it('하이픈 구분 날짜를 파싱', () => {
    const date = parseDate('2024-03-15 09:00');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(2); // 0-indexed
    expect(date.getDate()).toBe(15);
  });

  it('하이픈을 슬래시로 변환 (Safari 호환)', () => {
    const date = parseDate('2024-01-01');
    expect(date.getFullYear()).toBe(2024);
  });

  it('시간 포함 문자열도 파싱', () => {
    const date = parseDate('2024-12-31 23:59');
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(31);
  });

  it('하이픈이 없는 문자열은 그대로 Date 생성자로 전달', () => {
    const date = parseDate('2024/03/15');
    expect(date.getFullYear()).toBe(2024);
  });

  it('초까지 포함된 날짜 문자열', () => {
    const date = parseDate('2024-06-15 09:30:45');
    expect(date.getHours()).toBe(9);
    expect(date.getMinutes()).toBe(30);
  });
});

describe('isCurrentDateInRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15 12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('현재 날짜가 범위 내이면 true', () => {
    expect(isCurrentDateInRange('2024-06-01 00:00 ~ 2024-06-30 23:59')).toBe(true);
  });

  it('현재 날짜가 범위 전이면 false', () => {
    expect(isCurrentDateInRange('2024-07-01 00:00 ~ 2024-07-30 23:59')).toBe(false);
  });

  it('현재 날짜가 범위 후이면 false', () => {
    expect(isCurrentDateInRange('2024-01-01 00:00 ~ 2024-01-31 23:59')).toBe(false);
  });

  it('null이면 false', () => {
    expect(isCurrentDateInRange(null)).toBe(false);
  });

  it('빈 문자열이면 false', () => {
    expect(isCurrentDateInRange('')).toBe(false);
  });

  it('" ~ "가 없으면 false', () => {
    expect(isCurrentDateInRange('2024-06-01')).toBe(false);
  });

  it('" ~ " 뒤가 비어있으면 false', () => {
    expect(isCurrentDateInRange('2024-06-01 ~ ')).toBe(false);
  });

  it('시작일과 같은 날이면 true', () => {
    expect(isCurrentDateInRange('2024-06-15 00:00 ~ 2024-06-30 23:59')).toBe(true);
  });

  it('종료일과 같은 시간이면 true (<=)', () => {
    vi.setSystemTime(new Date('2024-06-30 23:59:00'));
    expect(isCurrentDateInRange('2024-06-01 00:00 ~ 2024-06-30 23:59')).toBe(true);
  });

  it('"~"만 있고 공백이 없어도 분리됨 (includes " ~ " 실패)', () => {
    expect(isCurrentDateInRange('2024-06-01~2024-06-30')).toBe(false);
  });

  it('시작과 종료가 동일한 시간이면 그 정확한 시점에 true', () => {
    vi.setSystemTime(new Date('2024-06-15 10:00:00'));
    expect(isCurrentDateInRange('2024-06-15 10:00 ~ 2024-06-15 10:00')).toBe(true);
  });
});

describe('isCurrentDateByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15 12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('미래 날짜이면 true', () => {
    expect(isCurrentDateByDate('2024-12-31')).toBe(true);
  });

  it('과거 날짜이면 false', () => {
    expect(isCurrentDateByDate('2024-01-01')).toBe(false);
  });

  it('null이면 false', () => {
    expect(isCurrentDateByDate(null)).toBe(false);
  });

  it('빈 문자열이면 false', () => {
    expect(isCurrentDateByDate('')).toBe(false);
  });

  it('길이 1 이하 문자열이면 false', () => {
    expect(isCurrentDateByDate('X')).toBe(false);
  });
});

describe('isWithinSevenDays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15 12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('3일 후는 7일 이내', () => {
    expect(isWithinSevenDays('2024-06-18 12:00:00')).toBe(true);
  });

  it('정확히 7일 후는 7일 이내', () => {
    expect(isWithinSevenDays('2024-06-22 12:00:00')).toBe(true);
  });

  it('8일 후는 7일 초과', () => {
    expect(isWithinSevenDays('2024-06-23 12:00:01')).toBe(false);
  });

  it('과거 날짜는 false', () => {
    expect(isWithinSevenDays('2024-06-10 12:00:00')).toBe(false);
  });

  it('오늘은 true (diff = 0)', () => {
    expect(isWithinSevenDays('2024-06-15 12:00:00')).toBe(true);
  });

  it('7일 + 1초 후는 false', () => {
    // 정확히 7일 = 604800000ms, 1초 추가
    const target = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 1000);
    expect(isWithinSevenDays(target.toISOString())).toBe(false);
  });

  it('1초 후는 true', () => {
    const target = new Date(Date.now() + 1000);
    expect(isWithinSevenDays(target.toISOString())).toBe(true);
  });
});

describe('extractEndDate', () => {
  it('" ~ "로 분리된 범위에서 끝 날짜 추출', () => {
    expect(extractEndDate('2024-01-01 ~ 2024-06-30')).toBe('2024-06-30');
  });

  it('null이면 null', () => {
    expect(extractEndDate(null)).toBeNull();
  });

  it('" ~ "가 없으면 undefined → null', () => {
    expect(extractEndDate('2024-06-30')).toBeNull();
  });

  it('빈 문자열이면 null (split 결과 [1]이 undefined)', () => {
    expect(extractEndDate('')).toBeNull();
  });
});

describe('calculateDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15 12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('null이면 noInfo 상태', () => {
    const result = calculateDueDate(null);
    expect(result.status).toBe('noInfo');
  });

  it('유효하지 않은 날짜면 invalid 상태', () => {
    const result = calculateDueDate('invalid-date');
    expect(result.status).toBe('invalid');
  });

  it('이미 지난 날짜면 expired 상태', () => {
    const result = calculateDueDate('2024-06-14 12:00:00');
    expect(result.status).toBe('expired');
  });

  it('1일 이상 남으면 daysLeft 상태', () => {
    const result = calculateDueDate('2024-06-20 12:00:00');
    expect(result.status).toBe('daysLeft');
  });

  it('1일 미만(시간 단위) 남으면 urgent 상태', () => {
    const result = calculateDueDate('2024-06-15 18:00:00');
    expect(result.status).toBe('urgent');
  });

  it('몇 분만 남으면 urgent + 분 단위 메시지', () => {
    const result = calculateDueDate('2024-06-15 12:30:00');
    expect(result.status).toBe('urgent');
    expect(result.message).toContain('date.minutesLater');
  });

  it('정확히 현재 시간이면 expired', () => {
    const result = calculateDueDate('2024-06-15 12:00:00');
    expect(result.status).toBe('expired');
  });

  it('정확히 24시간 후면 daysLeft (days=1)', () => {
    const result = calculateDueDate('2024-06-16 12:00:00');
    expect(result.status).toBe('daysLeft');
    expect(result.message).toContain('days:1');
  });

  it('23시간 59분 후면 urgent (hours 단위)', () => {
    const result = calculateDueDate('2024-06-16 11:59:00');
    expect(result.status).toBe('urgent');
    expect(result.message).toContain('date.hoursLater');
  });

  it('1초 후면 urgent + 0분 → hours가 0이므로 minutesLater', () => {
    const result = calculateDueDate('2024-06-15 12:00:01');
    expect(result.status).toBe('urgent');
    expect(result.message).toContain('date.minutesLater');
  });

  it('borderColor가 상태에 따라 다름', () => {
    expect(calculateDueDate(null).borderColor).toBe('border-amber-500');
    expect(calculateDueDate('2024-06-14').borderColor).toBe('border-red-950');
    expect(calculateDueDate('2024-06-20').borderColor).toBe('border-amber-500');
    expect(calculateDueDate('2024-06-15 18:00:00').borderColor).toBe('border-red-700');
  });
});

describe('calculateRemainingTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15 12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('null이면 noInfo', () => {
    expect(calculateRemainingTime(null)).toContain('date.noInfo');
  });

  it('과거 시간이면 expired', () => {
    expect(calculateRemainingTime('2024-01-01 00:00:00')).toContain('date.expired');
  });

  it('1일 이상 남으면 days/hours/minutes 포함', () => {
    const result = calculateRemainingTime('2024-06-20 15:30:00');
    expect(result).toContain('date.remaining');
  });

  it('1일 미만이면 hours/minutes만', () => {
    const result = calculateRemainingTime('2024-06-15 18:30:00');
    expect(result).toContain('date.remainingHoursMinutes');
  });

  it('1시간 미만이면 minutes만', () => {
    const result = calculateRemainingTime('2024-06-15 12:45:00');
    expect(result).toContain('date.remainingMinutes');
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15 12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('방금 전 (0분 차이)', () => {
    expect(timeAgo(Date.now())).toContain('date.justNow');
  });

  it('분 단위', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    expect(timeAgo(fiveMinAgo)).toContain('date.minutesAgo');
  });

  it('시간 단위', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(timeAgo(twoHoursAgo)).toContain('date.hoursAgo');
  });

  it('일 단위', () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    expect(timeAgo(threeDaysAgo)).toContain('date.daysAgo');
  });

  it('59초 전은 justNow (분 단위 미만)', () => {
    const fiftyNineSecAgo = Date.now() - 59 * 1000;
    expect(timeAgo(fiftyNineSecAgo)).toContain('date.justNow');
  });

  it('정확히 60초 전은 minutesAgo', () => {
    const oneMinAgo = Date.now() - 60 * 1000;
    expect(timeAgo(oneMinAgo)).toContain('date.minutesAgo');
  });

  it('정확히 1시간 전은 hoursAgo', () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    expect(timeAgo(oneHourAgo)).toContain('date.hoursAgo');
  });
});
