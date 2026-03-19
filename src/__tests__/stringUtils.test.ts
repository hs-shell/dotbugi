import { describe, it, expect } from 'vitest';
import { removeSquareBrackets, formatDateString } from '@/lib/stringUtils';

describe('removeSquareBrackets', () => {
  it('대괄호와 내용을 제거', () => {
    expect(removeSquareBrackets('[A반] 프로그래밍')).toBe(' 프로그래밍');
  });

  it('여러 대괄호를 모두 제거', () => {
    expect(removeSquareBrackets('[A반] [2학기] 프로그래밍')).toBe('  프로그래밍');
  });

  it('대괄호가 없으면 원본 반환', () => {
    expect(removeSquareBrackets('프로그래밍')).toBe('프로그래밍');
  });

  it('빈 문자열 처리', () => {
    expect(removeSquareBrackets('')).toBe('');
  });

  it('빈 대괄호 제거', () => {
    expect(removeSquareBrackets('[] 과목')).toBe(' 과목');
  });

  it('중첩 대괄호: [^\\]]*는 ]를 포함하지 않으므로 [[내부] 매칭 → "]" 남음', () => {
    // 정규식 /\[[^\]]*\]/g: [[내부] 가 첫 매치 → 제거 → "]" 남음
    expect(removeSquareBrackets('[[내부]]')).toBe(']');
  });

  it('닫히지 않은 대괄호는 유지', () => {
    expect(removeSquareBrackets('[미완성')).toBe('[미완성');
  });

  it('숫자가 포함된 대괄호 제거', () => {
    expect(removeSquareBrackets('[001] 과제')).toBe(' 과제');
  });

  it('특수문자가 포함된 대괄호 제거', () => {
    expect(removeSquareBrackets('[A-1반] 수업')).toBe(' 수업');
  });
});

describe('formatDateString', () => {
  it('전체 날짜 범위를 축약 형식으로 변환', () => {
    expect(formatDateString('2024-03-15 09:00:00 ~ 2024-03-22 23:59:00'))
      .toBe('24.03.15 09:00 ~ 24.03.22 23:59');
  });

  it('null이면 i18n 키 반환', () => {
    const result = formatDateString(null);
    expect(result).toBe('date.noDeadline');
  });

  it('매칭되지 않는 형식은 원본 그대로 반환', () => {
    expect(formatDateString('마감 없음')).toBe('마감 없음');
  });

  it('빈 문자열은 falsy이므로 noDeadline 반환', () => {
    expect(formatDateString('')).toBe('date.noDeadline');
  });

  it('초 부분이 없는 형식은 원본 반환', () => {
    expect(formatDateString('2024-03-15 09:00 ~ 2024-03-22 23:59'))
      .toBe('2024-03-15 09:00 ~ 2024-03-22 23:59');
  });
});
