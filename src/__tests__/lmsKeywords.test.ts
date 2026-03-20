import { describe, it, expect } from 'vitest';
import { normalizeLmsDate, normalizeLmsRange, NOT_SUBMITTED, BULK_APPROVED } from '@/lib/lmsKeywords';

describe('normalizeLmsDate', () => {
  it('null 반환', () => {
    expect(normalizeLmsDate(null)).toBeNull();
  });

  it('빈 문자열은 falsy이므로 null 반환', () => {
    expect(normalizeLmsDate('')).toBeNull();
  });

  it('이미 ISO-like 형식(ko/en)이면 그대로 반환', () => {
    expect(normalizeLmsDate('2024-03-15 09:00')).toBe('2024-03-15 09:00');
  });

  it('ISO 형식에 초까지 포함되어도 그대로 반환', () => {
    expect(normalizeLmsDate('2024-03-15 09:00:00')).toBe('2024-03-15 09:00:00');
  });

  it('일본어 형식 파싱 (요일 포함)', () => {
    expect(normalizeLmsDate('2023年 04月 24日(月曜日) 10:50')).toBe('2023-04-24 10:50');
  });

  it('중국어 형식 파싱 (星期 포함)', () => {
    expect(normalizeLmsDate('2023年04月24日 星期一 10:50')).toBe('2023-04-24 10:50');
  });

  it('일본어 형식 - 공백 없는 경우', () => {
    expect(normalizeLmsDate('2023年04月24日 10:50')).toBe('2023-04-24 10:50');
  });

  it('앞뒤 공백은 trim', () => {
    expect(normalizeLmsDate('  2024-03-15 09:00  ')).toBe('2024-03-15 09:00');
  });

  it('매칭 안 되는 형식은 원본 반환', () => {
    expect(normalizeLmsDate('March 15, 2024')).toBe('March 15, 2024');
  });
});

describe('normalizeLmsRange', () => {
  it('null 반환', () => {
    expect(normalizeLmsRange(null)).toBeNull();
  });

  it('~ 없는 단일 날짜는 normalizeLmsDate로 처리', () => {
    expect(normalizeLmsRange('2023年04月24日 10:50')).toBe('2023-04-24 10:50');
  });

  it('ko/en range 정규화', () => {
    expect(normalizeLmsRange('2024-03-15 09:00 ~ 2024-03-22 23:59'))
      .toBe('2024-03-15 09:00 ~ 2024-03-22 23:59');
  });

  it('ja range 정규화', () => {
    expect(normalizeLmsRange('2023年 04月 24日(月曜日) 10:50 ~ 2023年 05月 01日(月曜日) 23:59'))
      .toBe('2023-04-24 10:50 ~ 2023-05-01 23:59');
  });

  it('zh range 정규화', () => {
    expect(normalizeLmsRange('2023年04月24日 星期一 10:50 ~ 2023年05月01日 星期一 23:59'))
      .toBe('2023-04-24 10:50 ~ 2023-05-01 23:59');
  });

  it('빈 문자열은 falsy이므로 null 반환', () => {
    expect(normalizeLmsRange('')).toBeNull();
  });
});

describe('NOT_SUBMITTED', () => {
  it('한국어 포함', () => {
    expect(NOT_SUBMITTED).toContain('미제출');
  });

  it('영어 포함', () => {
    expect(NOT_SUBMITTED).toContain('Not submitted');
  });

  it('일본어 포함', () => {
    expect(NOT_SUBMITTED).toContain('提出なし');
  });

  it('중국어 포함', () => {
    expect(NOT_SUBMITTED).toContain('没有作业');
  });
});

describe('BULK_APPROVED', () => {
  it('한국어 포함', () => {
    expect(BULK_APPROVED).toContain('일괄출석인정');
  });

  it('영어 포함', () => {
    expect(BULK_APPROVED).toContain('Batch attendance');
  });
});
