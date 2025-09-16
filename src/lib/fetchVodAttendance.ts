import { VodAttendanceData } from '@/content/types';

/**
 * 온라인 출석부 정보 가져오기
 *
 * @param link 강의 링크
 * @returns [{온라인 강의 제목, 출석 여부, 주차정보}...]
 */
export const fetchVodAttendance = async (link: string) => {
  try {
    const response = await fetch(link, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const headerMap: Record<string, number> = {};

    const headers = Array.from(doc.querySelectorAll('.user_progress_table > thead > tr > th'));

    headers.forEach((header, index) => {
      const text = header.textContent?.trim() || '';
      if (text === '강의 자료') headerMap['title'] = index;
      else if (text === '출석') headerMap['isAttendance'] = index;
      else if (text === '주차 출석') headerMap['weeklyAttendance'] = index;
    });

    const rows = Array.from(doc.querySelectorAll('.user_progress_table > tbody > tr'));

    const spanTable: (number | undefined)[] = [];
    const cellValues: (string | null)[] = [];
    const vods: VodAttendanceData[] = [];
    let idx = 0;
    let lastWeeklyAttendance = '';
    rows.forEach((row) => {
      try {
        const cells = Array.from(row.querySelectorAll('td'));
        let colIndex = 0;
        const rowData: (string | null)[] = [];

        while (spanTable[colIndex] && spanTable[colIndex]! > 0) {
          rowData.push(cellValues[colIndex] || null);
          spanTable[colIndex]! -= 1;
          colIndex++;
        }

        cells.forEach((cell) => {
          while (spanTable[colIndex] && spanTable[colIndex]! > 0) {
            rowData.push(cellValues[colIndex] || null);
            spanTable[colIndex]! -= 1;
            colIndex++;
          }

          const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);
          const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
          const cellContent = cell.textContent?.trim() || '';

          for (let i = 0; i < colspan; i++) {
            rowData.push(cellContent);

            if (rowspan > 1) {
              spanTable[colIndex] = rowspan - 1;
              cellValues[colIndex] = cellContent;
            } else {
              cellValues[colIndex] = null;
            }
            colIndex++;
          }
        });

        while (colIndex < spanTable.length) {
          if (spanTable[colIndex] && spanTable[colIndex]! > 0) {
            rowData.push(cellValues[colIndex] || null);
            spanTable[colIndex]! -= 1;
          } else {
            rowData.push(null);
          }
          colIndex++;
        }

        let weeklyAttendance =
          headerMap['weeklyAttendance'] !== undefined ? rowData[headerMap['weeklyAttendance']] || '' : '';
        if (weeklyAttendance) {
          lastWeeklyAttendance = weeklyAttendance;
        } else {
          weeklyAttendance = lastWeeklyAttendance;
        }

        if (weeklyAttendance.includes('일괄출석인정')) weeklyAttendance = 'o';

        const title = headerMap['title'] !== undefined ? rowData[headerMap['title']] || '' : '';
        const isAttendance = headerMap['isAttendance'] !== undefined ? rowData[headerMap['isAttendance']] || '' : '';

        let weekStr = rowData[0] || '';
        if (weekStr !== '' && !isNaN(parseInt(weekStr))) {
          idx = parseInt(weekStr);
        } else {
          weekStr = idx.toString();
        }

        if (!title || !isAttendance) {
          return;
        }
        const week = parseInt(weekStr);

        vods.push({
          title,
          isAttendance,
          weeklyAttendance,
          week,
        });
      } catch (error) {
        console.error(`[Dotbugi] 영상 강의 조회 오류: ${link} ${row}`, error);
      }
    });

    return vods;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
