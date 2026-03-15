import { Vod, CourseBase } from '@/content/types';
import { isCurrentDateByDate, isCurrentDateInRange } from '@/lib/utils';

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
    if (!isCurrentDateInRange(vod.range)) continue;
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
    .filter((item) => isCurrentDateByDate(item.dueDate))
    .map((item) => ({ ...course, ...item }));
}

/**
 * 키 생성 함수 기반으로 중복 제거하면서 배열에 추가
 */
export function deduplicateInto<T>(
  target: T[],
  source: T[],
  seen: Set<string>,
  getKey: (item: T) => string,
): void {
  for (const item of source) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      target.push(item);
    }
  }
}
