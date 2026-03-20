import { VodAttendanceData } from '@/types';
import { fetchHtml } from './fetchHtml';

// 출석부 테이블 컬럼 인덱스 (user_progress_table)
// [주차(0)] [강의 자료(1)] [출석인정 요구시간(2)] [총 학습시간(3)] [출석(4)] [주차 출석(5)]
const COL = {
  WEEK: 0,
  TITLE: 1,
  ATTENDANCE: 4,
  WEEKLY_ATTENDANCE: 5,
} as const;

import { BULK_APPROVED } from './lmsKeywords';

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

/**
 * 온라인 출석부 정보 가져오기
 */
export const fetchVodAttendance = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const rows = doc.querySelectorAll('.user_progress_table > tbody > tr');

    const pendingSpans: (number | undefined)[] = [];
    const spanValues: (string | null)[] = [];
    const results: VodAttendanceData[] = [];
    let currentWeek = 0;
    let lastWeeklyAttendance = '';

    rows.forEach((row) => {
      try {
        const cells = flattenRow(row, pendingSpans, spanValues);

        const title = cells[COL.TITLE] || '';
        const isAttendance = cells[COL.ATTENDANCE] || '';

        let weeklyAttendance = cells[COL.WEEKLY_ATTENDANCE] || '';
        if (weeklyAttendance) {
          lastWeeklyAttendance = weeklyAttendance;
        } else {
          weeklyAttendance = lastWeeklyAttendance;
        }
        if (BULK_APPROVED.some((keyword) => weeklyAttendance.includes(keyword))) weeklyAttendance = 'o';

        const parsedWeek = parseInt(cells[COL.WEEK] || '');
        if (!isNaN(parsedWeek)) currentWeek = parsedWeek;

        if (!title || !isAttendance) return;

        results.push({ title, isAttendance, weeklyAttendance, week: currentWeek });
      } catch (error) {
        console.error(`[Dotbugi] 출석부 행 파싱 오류: ${link}`, error);
      }
    });

    return results;
  } catch (error) {
    console.error('[Dotbugi] 출석부 조회 오류:', error);
    throw error;
  }
};
