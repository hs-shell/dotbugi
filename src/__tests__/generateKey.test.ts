import { describe, it, expect } from 'vitest';
import { makeVodKey, makeItemKey, makeVodGroupKey } from '@/lib/generateKey';

describe('makeVodKey', () => {
  it('courseId-title-week 형식의 키 생성', () => {
    expect(makeVodKey('123', '강의1', 3)).toBe('123-강의1-3');
  });

  it('빈 문자열도 키 생성', () => {
    expect(makeVodKey('', '', 0)).toBe('--0');
  });

  it('특수문자 포함', () => {
    expect(makeVodKey('c-1', 'A/B', 1)).toBe('c-1-A/B-1');
  });
});

describe('makeItemKey', () => {
  it('courseId-title-dueDate 형식의 키 생성', () => {
    expect(makeItemKey('123', '과제1', '2024-06-15')).toBe('123-과제1-2024-06-15');
  });

  it('빈 값 처리', () => {
    expect(makeItemKey('', '', '')).toBe('--');
  });
});

describe('makeVodGroupKey', () => {
  it('courseId-subject-range 형식의 키 생성', () => {
    expect(makeVodGroupKey('123', '1주차', '2024-01-01 ~ 2024-01-07'))
      .toBe('123-1주차-2024-01-01 ~ 2024-01-07');
  });

  it('range가 null이면 null 포함', () => {
    expect(makeVodGroupKey('123', '1주차', null)).toBe('123-1주차-null');
  });

  it('같은 courseId+subject이지만 다른 range면 다른 키', () => {
    const key1 = makeVodGroupKey('123', '1주차', '2024-01-01 ~ 2024-01-07');
    const key2 = makeVodGroupKey('123', '1주차', '2024-01-08 ~ 2024-01-14');
    expect(key1).not.toBe(key2);
  });

  it('한글/특수문자 포함 키 생성', () => {
    expect(makeVodGroupKey('C-1', '1주차 (보충)', '2024-01-01 ~ 2024-01-07'))
      .toBe('C-1-1주차 (보충)-2024-01-01 ~ 2024-01-07');
  });
});

describe('키 충돌 검증', () => {
  it('makeVodKey - 서로 다른 입력은 다른 키 생성', () => {
    expect(makeVodKey('C1', '강의1', 1)).not.toBe(makeVodKey('C1', '강의1', 2));
    expect(makeVodKey('C1', '강의1', 1)).not.toBe(makeVodKey('C2', '강의1', 1));
    expect(makeVodKey('C1', '강의1', 1)).not.toBe(makeVodKey('C1', '강의2', 1));
  });

  it('makeItemKey - 서로 다른 입력은 다른 키 생성', () => {
    expect(makeItemKey('C1', '과제', '2024-01')).not.toBe(makeItemKey('C1', '과제', '2024-02'));
  });
});
