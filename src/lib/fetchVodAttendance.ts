import { VodAttendanceData } from '@/types';
import { fetchHtml } from './fetchHtml';
import { BULK_APPROVED, COL_ATTENDANCE, COL_WEEKLY_ATTENDANCE, COL_REQUIRED_TIME } from './lmsKeywords';

// ── 동적 컬럼 감지 ─────────────────────────────────────────────────

interface ColumnMap {
  WEEK: number;
  TITLE: number;
  REQUIRED_TIME: number | null; // 조건부 컬럼 (없을 수 있음)
  WATCHED_TIME: number;
  ATTENDANCE: number;
  WEEKLY_ATTENDANCE: number;
}

/**
 * thead에서 컬럼 헤더 텍스트를 읽어 각 컬럼의 인덱스를 동적으로 결정
 * "출석인정 요구시간" 컬럼이 없는 5열 테이블도 처리
 *
 * 매칭 순서가 중요: "출석인정 요구시간"과 "주차 출석" 모두 "출석"을 포함하므로
 * 구체적인 키워드를 먼저 매칭하고, "출석"은 나머지에서 매칭
 */
export function detectColumns(doc: Document): ColumnMap | null {
  const headers = doc.querySelectorAll('.user_progress_table > thead > tr > th');
  if (headers.length < 5) return null;

  let attendanceIdx = -1;
  let weeklyAttendanceIdx = -1;
  let requiredTimeIdx: number | null = null;
  const matched = new Set<number>();

  // 1차: 구체적인 키워드 먼저 매칭 (둘 다 "출석"을 포함하므로 선점)
  headers.forEach((th, i) => {
    const text = th.textContent?.trim() || '';
    if (COL_WEEKLY_ATTENDANCE.some((kw) => text.includes(kw))) {
      weeklyAttendanceIdx = i;
      matched.add(i);
    } else if (COL_REQUIRED_TIME.some((kw) => text.includes(kw))) {
      requiredTimeIdx = i;
      matched.add(i);
    }
  });

  // 2차: "출석" 매칭 (이미 매칭된 컬럼 제외)
  headers.forEach((th, i) => {
    if (matched.has(i)) return;
    const text = th.textContent?.trim() || '';
    if (attendanceIdx === -1 && COL_ATTENDANCE.some((kw) => text.includes(kw))) {
      attendanceIdx = i;
    }
  });

  if (attendanceIdx === -1 || weeklyAttendanceIdx === -1) return null;

  // 고정 컬럼: 주차(0), 강의 자료(1)
  // WATCHED_TIME은 ATTENDANCE 바로 앞 컬럼
  return {
    WEEK: 0,
    TITLE: 1,
    REQUIRED_TIME: requiredTimeIdx,
    WATCHED_TIME: attendanceIdx - 1,
    ATTENDANCE: attendanceIdx,
    WEEKLY_ATTENDANCE: weeklyAttendanceIdx,
  };
}

// ── 시간 추출 ───────────────────────────────────────────────────────

/**
 * "42:201회 열람" 같은 셀 텍스트에서 시간 부분만 추출
 */
function extractTime(raw: string | null): string {
  if (!raw) return '';
  const match = raw.match(/^(\d{1,2}:\d{2}(:\d{2})?)/);
  return match ? match[1] : '';
}

// ── rowspan/colspan 평탄화 ──────────────────────────────────────────

/**
 * rowspan/colspan이 있는 테이블 행을 평탄화된 셀 값 배열로 변환
 */
function flattenRow(
  row: Element,
  pendingSpans: (number | undefined)[],
  spanValues: (string | null)[],
): (string | null)[] {
  const cells = Array.from(row.querySelectorAll('td'));
  const rowData: (string | null)[] = [];
  let col = 0;

  const consumePendingSpans = () => {
    while (pendingSpans[col] && pendingSpans[col]! > 0) {
      rowData.push(spanValues[col] || null);
      pendingSpans[col]! -= 1;
      col++;
    }
  };

  consumePendingSpans();

  for (const cell of cells) {
    consumePendingSpans();

    const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);
    const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
    const content = cell.textContent?.trim() || '';

    for (let i = 0; i < colspan; i++) {
      rowData.push(content);
      if (rowspan > 1) {
        pendingSpans[col] = rowspan - 1;
        spanValues[col] = content;
      } else {
        spanValues[col] = null;
      }
      col++;
    }
  }

  while (col < pendingSpans.length) {
    if (pendingSpans[col] && pendingSpans[col]! > 0) {
      rowData.push(spanValues[col] || null);
      pendingSpans[col]! -= 1;
    } else {
      rowData.push(null);
    }
    col++;
  }

  return rowData;
}

// ── 메인 ────────────────────────────────────────────────────────────

/**
 * 출석부 테이블 DOM을 파싱하여 출석 데이터 배열 반환
 * (테스트 가능하도록 분리)
 */
export function parseAttendanceTable(doc: Document): VodAttendanceData[] {
  const col = detectColumns(doc);
  if (!col) throw new Error('출석부 테이블 헤더 파싱 실패');

  const rows = doc.querySelectorAll('.user_progress_table > tbody > tr');

  const pendingSpans: (number | undefined)[] = [];
  const spanValues: (string | null)[] = [];
  const results: VodAttendanceData[] = [];
  let currentWeek = 0;
  let lastWeeklyAttendance = '';

  rows.forEach((row) => {
    try {
      const cells = flattenRow(row, pendingSpans, spanValues);

      const title = cells[col.TITLE] || '';
      const isAttendance = cells[col.ATTENDANCE] || '';

      let weeklyAttendance = cells[col.WEEKLY_ATTENDANCE] || '';
      if (weeklyAttendance) {
        lastWeeklyAttendance = weeklyAttendance;
      } else {
        weeklyAttendance = lastWeeklyAttendance;
      }
      if (BULK_APPROVED.some((keyword) => weeklyAttendance.includes(keyword))) weeklyAttendance = 'o';

      const parsedWeek = parseInt(cells[col.WEEK] || '');
      if (!isNaN(parsedWeek)) currentWeek = parsedWeek;

      if (!title || !isAttendance) return;

      const requiredTime = col.REQUIRED_TIME !== null ? (cells[col.REQUIRED_TIME] || '') : '';
      const watchedTime = extractTime(cells[col.WATCHED_TIME]);

      results.push({
        title,
        isAttendance,
        weeklyAttendance,
        week: currentWeek,
        ...(requiredTime && { requiredTime }),
        ...(watchedTime && { watchedTime }),
      });
    } catch (error) {
      // 개별 행 파싱 실패는 무시하고 계속 진행
    }
  });

  return results;
}

/**
 * 온라인 출석부 정보 가져오기 (user_progress_a.php)
 * thead에서 컬럼 구조를 동적으로 감지하여 5열/6열 테이블 모두 처리
 */
export const fetchVodAttendance = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    return parseAttendanceTable(doc);
  } catch (error) {
    throw new Error(`출석부 조회 실패`, { cause: error });
  }
};
