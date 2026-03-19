import { describe, it, expect } from 'vitest';
import { isAttended, isAbsent } from '@/lib/attendance';

describe('isAttended', () => {
  it('소문자 "o"는 출석', () => {
    expect(isAttended('o')).toBe(true);
  });

  it('대문자 "O"는 출석', () => {
    expect(isAttended('O')).toBe(true);
  });

  it('공백 포함 " o "는 출석', () => {
    expect(isAttended(' o ')).toBe(true);
  });

  it('"x"는 미출석', () => {
    expect(isAttended('x')).toBe(false);
  });

  it('"X"는 미출석', () => {
    expect(isAttended('X')).toBe(false);
  });

  it('빈 문자열은 미출석', () => {
    expect(isAttended('')).toBe(false);
  });

  it('"출석"같은 한글은 미출석으로 판단', () => {
    expect(isAttended('출석')).toBe(false);
  });

  it('"O출석" 같은 혼합 문자열은 미출석', () => {
    expect(isAttended('O출석')).toBe(false);
  });

  it('공백만 있는 문자열은 미출석 (trim 후 빈 문자열)', () => {
    expect(isAttended('   ')).toBe(false);
  });

  it('탭 문자 포함된 "\\to\\t"는 미출석 (trim 후 "o"가 아님)', () => {
    // '\to\t' → trim → 'o' 가 됨
    expect(isAttended('\to\t')).toBe(true);
  });

  it('"0" (숫자 영)은 미출석 ("o"가 아님)', () => {
    expect(isAttended('0')).toBe(false);
  });
});

describe('isAbsent', () => {
  it('"X"는 결석', () => {
    expect(isAbsent('X')).toBe(true);
  });

  it('"x"는 결석', () => {
    expect(isAbsent('x')).toBe(true);
  });

  it('"X (결석)"처럼 X로 시작하면 결석', () => {
    expect(isAbsent('X (결석)')).toBe(true);
  });

  it('"o"는 결석 아님', () => {
    expect(isAbsent('o')).toBe(false);
  });

  it('빈 문자열은 결석 아님', () => {
    expect(isAbsent('')).toBe(false);
  });

  it('"결석"같은 한글은 결석 아님 (X로 시작하지 않으므로)', () => {
    expect(isAbsent('결석')).toBe(false);
  });

  it('"xX" 소문자 x로 시작하면 결석', () => {
    expect(isAbsent('xX')).toBe(true);
  });

  it('" X" 공백으로 시작하면 결석 아님 (toUpperCase 후 startsWith)', () => {
    // ' X'.toUpperCase() = ' X', startsWith('X') = false
    expect(isAbsent(' X')).toBe(false);
  });
});
