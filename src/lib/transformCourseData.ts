import { Vod, CourseBase } from '@/types';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';

const skipDateFilter = !!import.meta.env.VITE_MOCK_SKIP_DATE_FILTER;

/**
 * VOD 데이터와 출석 데이터를 title+week 기준으로 조인하고, 현재 기간 내 항목만 반환
 */
export function mergeVodWithAttendance(
  course: CourseBase,
  vodList: { week: number; subject: string; title: string; url: string; range: string | null; length: string }[],
  attendanceList: { title: string; isAttendance: string; weeklyAttendance: string; week: number }[]
): Vod[] {
  const attendanceByKey = new Map<string, (typeof attendanceList)[number]>();
  for (const att of attendanceList) {
    attendanceByKey.set(`${att.title}-${att.week}`, att);
  }

  const results: Vod[] = [];
  for (const vod of vodList) {
    if (!skipDateFilter && !isCurrentDateInRange(vod.range)) continue;
    const attendance = attendanceByKey.get(`${vod.title}-${vod.week}`);
    if (!attendance) continue;
    results.push({
      ...course,
      ...vod,
      isAttendance: attendance.isAttendance,
      weeklyAttendance: attendance.weeklyAttendance,
    });
  }
  return results;
}

/**
 * 마감일 기반 항목(과제/퀴즈)에 course 정보를 병합하고, 현재 유효한 항목만 반환
 */
export function mergeDueDateItems<T extends { title: string; dueDate: string | null }>(
  course: CourseBase,
  items: T[],
): (CourseBase & T)[] {
  return items
    .filter((item) => skipDateFilter || item.dueDate === null || isCurrentDateByDate(item.dueDate))
    .map((item) => ({ ...course, ...item }));
}

