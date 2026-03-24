import { describe, it, expect } from 'vitest';
import { detectColumns, parseAttendanceTable } from '@/lib/fetchVodAttendance';

function makeDoc(theadHtml: string, tbodyHtml = ''): Document {
  const html = `<table class="user_progress_table"><thead><tr>${theadHtml}</tr></thead><tbody>${tbodyHtml}</tbody></table>`;
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

// ── detectColumns ───────────────────────────────────────────────────

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
      expect(col!.WATCHED_TIME).toBe(3);
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
      expect(col!.WATCHED_TIME).toBe(2);
      expect(col!.ATTENDANCE).toBe(3);
      expect(col!.WEEKLY_ATTENDANCE).toBe(4);
    });
  });

  it('"출석인정 요구시간"이 "출석" 컬럼으로 잘못 매칭되지 않음', () => {
    const col = detectColumns(makeDoc(THEAD_6COL_KO));
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

// ── parseAttendanceTable: 6열 테이블 ────────────────────────────────

describe('parseAttendanceTable - 6열 테이블', () => {
  // 실제 LMS HTML 구조 재현 (출석인정 요구시간 있음, rowspan 포함)
  const TBODY_6COL = `
    <tr>
      <td rowspan="4">1</td>
      <td>W1-1 강의소개</td>
      <td>05:00</td>
      <td>05:19<br><button class="track_detail">2회 열람</button></td>
      <td>O</td>
      <td rowspan="4">O</td>
    </tr>
    <tr>
      <td>제1장-1. 강의영상</td>
      <td>27:00</td>
      <td>30:42<br><button class="track_detail">1회 열람</button></td>
      <td>O</td>
    </tr>
    <tr>
      <td>제1장-2. 강의영상</td>
      <td>26:00</td>
      <td>29:26<br><button class="track_detail">1회 열람</button></td>
      <td>O</td>
    </tr>
    <tr>
      <td>제1장-3. 강의영상</td>
      <td>21:00</td>
      <td>22:46<br><button class="track_detail">2회 열람</button></td>
      <td>O</td>
    </tr>
    <tr>
      <td rowspan="3">2</td>
      <td>제2장. 프로그램 구성요소 (1)</td>
      <td>34:00</td>
      <td>37:51<br><button class="track_detail">4회 열람</button></td>
      <td>O</td>
      <td rowspan="3">O</td>
    </tr>
    <tr>
      <td>제2장. 프로그램 구성요소 (2)</td>
      <td>22:00</td>
      <td>25:30<br><button class="track_detail">1회 열람</button></td>
      <td>O</td>
    </tr>
    <tr>
      <td>제2장. 프로그램 구성요소 (3)</td>
      <td>13:00</td>
      <td>14:50<br><button class="track_detail">1회 열람</button></td>
      <td>O</td>
    </tr>
  `;

  it('모든 강의의 출석/주차출석이 올바르게 파싱됨', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_6COL_KO, TBODY_6COL));
    expect(results).toHaveLength(7);
    results.forEach((r) => {
      expect(r.isAttendance).toBe('O');
      expect(r.weeklyAttendance).toBe('O');
    });
  });

  it('주차 번호가 rowspan으로 전파됨', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_6COL_KO, TBODY_6COL));
    expect(results.filter((r) => r.week === 1)).toHaveLength(4);
    expect(results.filter((r) => r.week === 2)).toHaveLength(3);
  });

  it('출석인정 요구시간과 총 학습시간이 추출됨', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_6COL_KO, TBODY_6COL));
    expect(results[0].requiredTime).toBe('05:00');
    expect(results[0].watchedTime).toBe('05:19');
    expect(results[6].requiredTime).toBe('13:00');
    expect(results[6].watchedTime).toBe('14:50');
  });
});

// ── parseAttendanceTable: 5열 테이블 ────────────────────────────────

describe('parseAttendanceTable - 5열 테이블', () => {
  // 실제 LMS HTML 구조 재현 (출석인정 요구시간 없음)
  const TBODY_5COL = `
    <tr>
      <td rowspan="1">1</td>
      <td>1주차 동영상 강의</td>
      <td>28:52<br><button class="track_detail">3회 열람</button></td>
      <td>O</td>
      <td rowspan="1">O</td>
    </tr>
    <tr>
      <td rowspan="1">2</td>
      <td>2주차 동영상 강의</td>
      <td>32:16<br><button class="track_detail">3회 열람</button></td>
      <td>O</td>
      <td rowspan="1">O</td>
    </tr>
    <tr>
      <td rowspan="1">3</td>
      <td>3주차 동영상 강의</td>
      <td>32:54<br><button class="track_detail">1회 열람</button></td>
      <td>O</td>
      <td rowspan="1">O</td>
    </tr>
    <tr>
      <td rowspan="1">4</td>
      <td>4주차 동영상 강의</td>
      <td>-</td>
      <td>X</td>
      <td rowspan="1">X</td>
    </tr>
    <tr>
      <td>5</td>
      <td>5주차 동영상 강의</td>
      <td>-</td>
      <td></td>
      <td></td>
    </tr>
  `;

  it('5열 테이블에서도 출석/주차출석이 올바르게 파싱됨', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_5COL_KO, TBODY_5COL));
    // 5주차는 isAttendance 비어있어서 스킵
    expect(results).toHaveLength(4);

    expect(results[0]).toMatchObject({ title: '1주차 동영상 강의', isAttendance: 'O', weeklyAttendance: 'O', week: 1 });
    expect(results[1]).toMatchObject({ title: '2주차 동영상 강의', isAttendance: 'O', weeklyAttendance: 'O', week: 2 });
    expect(results[2]).toMatchObject({ title: '3주차 동영상 강의', isAttendance: 'O', weeklyAttendance: 'O', week: 3 });
    expect(results[3]).toMatchObject({ title: '4주차 동영상 강의', isAttendance: 'X', weeklyAttendance: 'X', week: 4 });
  });

  it('5열 테이블에서 requiredTime이 없음', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_5COL_KO, TBODY_5COL));
    results.forEach((r) => {
      expect(r.requiredTime).toBeUndefined();
    });
  });

  it('5열 테이블에서 watchedTime이 추출됨', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_5COL_KO, TBODY_5COL));
    expect(results[0].watchedTime).toBe('28:52');
    expect(results[1].watchedTime).toBe('32:16');
    // "-"는 시간이 아니므로 추출 안 됨
    expect(results[3].watchedTime).toBeUndefined();
  });

  it('미시청("-") 강의도 출석/결석 상태는 올바르게 파싱됨', () => {
    const results = parseAttendanceTable(makeDoc(THEAD_5COL_KO, TBODY_5COL));
    const week4 = results.find((r) => r.week === 4)!;
    expect(week4.isAttendance).toBe('X');
    expect(week4.weeklyAttendance).toBe('X');
  });
});
