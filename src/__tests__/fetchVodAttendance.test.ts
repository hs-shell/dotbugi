import { describe, it, expect } from 'vitest';
import { detectColumns } from '@/lib/fetchVodAttendance';

function makeDoc(theadHtml: string): Document {
  const html = `<table class="user_progress_table"><thead><tr>${theadHtml}</tr></thead><tbody></tbody></table>`;
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

// ── 6열 테이블 (출석인정 요구시간 있음) ─────────────────────────────

const THEAD_6COL_KO = `
  <th></th>
  <th>강의 자료</th>
  <th class="hidden-xs hidden-sm">출석인정 요구시간</th>
  <th>총 학습시간</th>
  <th>출석</th>
  <th>주차 출석</th>
`;

const THEAD_6COL_EN = `
  <th></th>
  <th>Resources</th>
  <th class="hidden-xs hidden-sm">Required</th>
  <th>Watched</th>
  <th>Attendance</th>
  <th>Week attendance</th>
`;

const THEAD_6COL_JA = `
  <th></th>
  <th>リソース</th>
  <th class="hidden-xs hidden-sm">Required</th>
  <th>Watched</th>
  <th>Attendance</th>
  <th>Week attendance</th>
`;

const THEAD_6COL_ZH = `
  <th></th>
  <th>资源</th>
  <th class="hidden-xs hidden-sm">Required</th>
  <th>Watched</th>
  <th>Attendance</th>
  <th>Week attendance</th>
`;

// ── 5열 테이블 (출석인정 요구시간 없음) ─────────────────────────────

const THEAD_5COL_KO = `
  <th></th>
  <th>강의 자료</th>
  <th>총 학습시간</th>
  <th>출석</th>
  <th>주차 출석</th>
`;

const THEAD_5COL_EN = `
  <th></th>
  <th>Resources</th>
  <th>Watched</th>
  <th>Attendance</th>
  <th>Week attendance</th>
`;

describe('detectColumns', () => {
  describe('6열 테이블 (출석인정 요구시간 있음)', () => {
    it.each([
      ['ko', THEAD_6COL_KO],
      ['en', THEAD_6COL_EN],
      ['ja', THEAD_6COL_JA],
      ['zh', THEAD_6COL_ZH],
    ])('%s: 올바른 컬럼 인덱스 반환', (_, thead) => {
      const col = detectColumns(makeDoc(thead));
      expect(col).not.toBeNull();
      expect(col!.WEEK).toBe(0);
      expect(col!.TITLE).toBe(1);
      expect(col!.REQUIRED_TIME).toBe(2);
      expect(col!.WATCHED_TIME).toBe(3); // ATTENDANCE - 1
      expect(col!.ATTENDANCE).toBe(4);
      expect(col!.WEEKLY_ATTENDANCE).toBe(5);
    });
  });

  describe('5열 테이블 (출석인정 요구시간 없음)', () => {
    it.each([
      ['ko', THEAD_5COL_KO],
      ['en', THEAD_5COL_EN],
    ])('%s: REQUIRED_TIME null, 나머지 인덱스 올바름', (_, thead) => {
      const col = detectColumns(makeDoc(thead));
      expect(col).not.toBeNull();
      expect(col!.WEEK).toBe(0);
      expect(col!.TITLE).toBe(1);
      expect(col!.REQUIRED_TIME).toBeNull();
      expect(col!.WATCHED_TIME).toBe(2); // ATTENDANCE - 1
      expect(col!.ATTENDANCE).toBe(3);
      expect(col!.WEEKLY_ATTENDANCE).toBe(4);
    });
  });

  it('"출석인정 요구시간"이 "출석" 컬럼으로 잘못 매칭되지 않음', () => {
    const col = detectColumns(makeDoc(THEAD_6COL_KO));
    // "출석인정 요구시간"(index 2)이 ATTENDANCE로 매칭되면 안 됨
    expect(col!.ATTENDANCE).not.toBe(2);
    expect(col!.ATTENDANCE).toBe(4);
  });

  it('헤더가 4열 미만이면 null', () => {
    const doc = makeDoc('<th></th><th>자료</th><th>출석</th>');
    expect(detectColumns(doc)).toBeNull();
  });

  it('출석/주차 출석 헤더가 없으면 null', () => {
    const doc = makeDoc('<th></th><th>자료</th><th>요구시간</th><th>학습시간</th><th>기타</th>');
    expect(detectColumns(doc)).toBeNull();
  });
});
