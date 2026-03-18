import { Vod, CourseBase } from '@/types';

/**
 * VOD 데이터와 출석 데이터를 title+week 기준으로 조인 (날짜 필터 없이 전체 반환)
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
 * 마감일 기반 항목(과제/퀴즈)에 course 정보를 병합 (날짜 필터 없이 전체 반환)
 */
export function mergeDueDateItems<T extends { title: string; dueDate: string | null }>(
  course: CourseBase,
  items: T[],
): (CourseBase & T)[] {
  return items.map((item) => ({ ...course, ...item }));
}

