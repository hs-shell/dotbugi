import { Vod } from '@/content/types';
import { makeVodGroupKey } from '@/utils/generate-key';
import { isAttended } from '@/lib/utils';

export type CardData = {
  done: number;
  total: number;
};

export function summarizeVods(vods: Vod[]): CardData {
  const groups: Record<string, Vod[]> = {};
  for (const vod of vods) {
    const key = makeVodGroupKey(vod.courseId, vod.subject, vod.range);
    (groups[key] ??= []).push(vod);
  }
  const groupList = Object.values(groups);
  const done = groupList.filter((g) => isAttended(g[0].weeklyAttendance)).length;
  return { done, total: groupList.length };
}
