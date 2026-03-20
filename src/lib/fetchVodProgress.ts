import { VodAttendanceData } from '@/types';
import { fetchHtml } from './fetchHtml';

function parseTimeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * VOD 학습 진도 정보 가져오기 (user_progress.php)
 *
 * `.user_progress` 테이블에서 출석인정 요구시간과 총 학습시간을 추출.
 * - 일반 강좌: 시청중 배지용 시간 데이터 제공 (출석 판정은 user_progress_a.php 사용)
 * - 커뮤니티 강좌: 출석 판정 + 시간 데이터 모두 담당 (user_progress_a.php 접근 불가)
 */
export const fetchVodProgress = async (link: string) => {
  try {
    const doc = await fetchHtml(link);
    const rows = doc.querySelectorAll('.user_progress > tbody > tr');

    const results: VodAttendanceData[] = [];
    let currentWeek = 0;

    rows.forEach((row) => {
      try {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length === 0) return;

        // 주차 파싱: sectiontitle이 있는 셀 (rowspan이 있을 수 있음)
        const sectionTitle = row.querySelector('.sectiontitle');
        if (sectionTitle) {
          const parsedWeek = parseInt(sectionTitle.textContent?.trim() || '', 10);
          if (!isNaN(parsedWeek)) currentWeek = parsedWeek;
        }

        // VOD 아이콘이 있는 행만 처리 (빈 주차 건너뛰기)
        const titleCell = cells.find((cell) => cell.querySelector('img[src*="vod"]'));
        if (!titleCell) return;

        // 제목 추출: 이미지 태그 뒤의 텍스트
        const title = titleCell.textContent?.trim() || '';
        if (!title) return;

        // 시간 데이터 추출: 출석인정 요구시간, 총 학습시간
        const timeCells = cells.filter((cell) => {
          const text = cell.textContent?.trim() || '';
          return /^\d{1,2}:\d{2}(:\d{2})?$/.test(text);
        });

        // 상세보기 버튼에서 추가 정보 추출
        const trackBtn = row.querySelector('.track_detail');

        let requiredTime = '';
        let watchedTime = '';

        if (timeCells.length >= 1) {
          requiredTime = timeCells[0].textContent?.trim() || '';
        }

        // 총 학습시간은 상세보기 버튼이 있는 셀에서 추출 (시간 텍스트 + 버튼이 공존)
        if (trackBtn) {
          const parentCell = trackBtn.closest('td');
          if (parentCell) {
            const textNodes = Array.from(parentCell.childNodes)
              .filter((node) => node.nodeType === 3)
              .map((node) => node.textContent?.trim() || '')
              .filter(Boolean);
            const timeText = textNodes.find((t) => /^\d{1,2}:\d{2}(:\d{2})?$/.test(t));
            if (timeText) watchedTime = timeText;
          }
        } else if (timeCells.length >= 2) {
          watchedTime = timeCells[1].textContent?.trim() || '';
        }

        // 출석 판단: 총 학습시간 >= 출석인정 요구시간
        const isAttendance =
          requiredTime && watchedTime && parseTimeToSeconds(watchedTime) >= parseTimeToSeconds(requiredTime)
            ? 'o'
            : 'x';

        results.push({
          title,
          isAttendance,
          weeklyAttendance: '', // 후처리에서 계산
          week: currentWeek,
          requiredTime,
          watchedTime,
        });
      } catch (error) {
        console.error(`[Dotbugi] 진도 행 파싱 오류: ${link}`, error);
      }
    });

    // 주차별 출석 계산: 해당 주차의 모든 VOD가 출석이면 'o'
    const weekGroups = new Map<number, VodAttendanceData[]>();
    for (const item of results) {
      const group = weekGroups.get(item.week) ?? [];
      group.push(item);
      weekGroups.set(item.week, group);
    }

    for (const [, group] of weekGroups) {
      const allAttended = group.every((item) => item.isAttendance === 'o');
      const weeklyAttendance = allAttended ? 'o' : 'x';
      for (const item of group) {
        item.weeklyAttendance = weeklyAttendance;
      }
    }

    return results;
  } catch (error) {
    console.error('[Dotbugi] VOD 진도 조회 오류:', error);
    throw error;
  }
};
