import { Vod, CourseBase } from '@/types';

/**
 * VOD 데이터와 출석 데이터를 title+week 기준으로 조인 (날짜 필터 없이 전체 반환)
 */
export function mergeVodWithAttendance(
  course: CourseBase,
  vodList: { week: number; subject: string; title: string; url: string; range: string | null; length: string }[],
  attendanceList: {
    title: string;
    isAttendance: string;
    weeklyAttendance: string;
    week: number;
    requiredTime?: string;
    watchedTime?: string;
  }[]
): Vod[] {
  // 출석부 표에는 URL 이 없어 같은 주차·같은 제목 강의는 나온 순서대로 짝짓는다 (#225)
  const attendanceByKey = new Map<string, (typeof attendanceList)[number][]>();
  for (const att of attendanceList) {
    const key = `${att.title}-${att.week}`;
    attendanceByKey.set(key, [...(attendanceByKey.get(key) ?? []), att]);
  }

  const results: Vod[] = [];
  for (const vod of vodList) {
    const attendance = attendanceByKey.get(`${vod.title}-${vod.week}`)?.shift();
    if (!attendance) continue;
    results.push({
      ...course,
      ...vod,
      isAttendance: attendance.isAttendance,
      weeklyAttendance: attendance.weeklyAttendance,
      requiredTime: attendance.requiredTime,
      watchedTime: attendance.watchedTime,
    });
  }
  return results;
}

/**
 * 마감일 기반 항목(과제/퀴즈)에 course 정보를 병합 (날짜 필터 없이 전체 반환)
 */
export function mergeDueDateItems<T extends { title: string; dueDate: string | null }>(
  course: CourseBase,
  items: T[]
): (CourseBase & T)[] {
  return items.map((item) => ({ ...course, ...item }));
}
