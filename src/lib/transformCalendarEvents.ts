import { startOfDay } from 'date-fns';
import { Vod } from '@/content/types';
import { removeSquareBrackets } from '@/lib/utils';
import { parseDate } from '@/lib/dateUtils';
import { makeVodGroupKey } from '@/utils/generate-key';

export type CalendarEvent = {
  id: string;
  type: 'vod' | 'assign' | 'quiz';
  title: string;
  subject: string;
  start: Date | null;
  end: Date | null;
};

export function vodGroupsToEvents(vods: Vod[]): CalendarEvent[] {
  const grouped: Record<string, Vod[]> = {};
  for (const vod of vods) {
    const key = makeVodGroupKey(vod.courseId, vod.subject, vod.range);
    (grouped[key] ??= []).push(vod);
  }

  return Object.entries(grouped).map(([key, items]) => {
    const range = items[0].range;
    const [startStr, endStr] = range ? range.split(' ~ ') : [null, null];
    return {
      id: key,
      type: 'vod' as const,
      start: startStr ? parseDate(startStr) : null,
      end: endStr ? parseDate(endStr) : null,
      title: removeSquareBrackets(items[0].courseTitle),
      subject: removeSquareBrackets(items[0].subject),
    };
  });
}

export function dueDateItemToEvent(
  item: { courseId: string; courseTitle: string; title: string; dueDate: string | null },
  type: 'assign' | 'quiz',
): CalendarEvent {
  const normalizedDate = item.dueDate ? startOfDay(new Date(item.dueDate)) : null;
  return {
    id: item.courseId + item.title + item.dueDate,
    type,
    start: normalizedDate,
    end: normalizedDate,
    title: removeSquareBrackets(item.courseTitle),
    subject: removeSquareBrackets(item.title),
  };
}
