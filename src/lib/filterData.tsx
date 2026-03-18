import { Vod, Assign, Quiz, CourseBase, Filters } from '@/types';
import { isAttended } from './utils';
import i18n from '@/i18n';

function matchesBase(item: CourseBase & { title: string }, courseTitles: string[], term: string): boolean {
  if (courseTitles.length > 0 && !courseTitles.includes(item.courseTitle)) return false;
  if (
    term &&
    !item.courseTitle.toLowerCase().includes(term) &&
    !item.title.toLowerCase().includes(term) &&
    !item.prof.toLowerCase().includes(term)
  )
    return false;
  return true;
}

// 필터 적용 for VODs
export function filterVods(vods: Vod[], filters: Filters, searchTerm: string, sortBy: keyof Vod): Vod[] {
  const { courseTitles, attendanceStatuses } = filters;
  const term = searchTerm.toLowerCase();

  const attendedLabel = i18n.t('attendance.attended', { ns: 'common' });
  const absentLabel = i18n.t('attendance.absent', { ns: 'common' });

  const data = vods.filter((vod) => {
    if (!matchesBase(vod, courseTitles, term)) return false;
    if (attendanceStatuses && attendanceStatuses.length > 0) {
      const status = isAttended(vod.isAttendance) ? attendedLabel : absentLabel;
      if (!attendanceStatuses.includes(status)) return false;
    }
    return true;
  });

  return data.sort((a, b) => {
    const attendanceA = isAttended(a.isAttendance);
    const attendanceB = isAttended(b.isAttendance);

    if (attendanceA !== attendanceB) {
      return attendanceA ? -1 : 1;
    }

    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        if (a.range === null && b.range !== null) return attendanceA ? -1 : 1;
        if (a.range !== null && b.range === null) return attendanceA ? 1 : -1;
        if (a.range === null && b.range === null) return 0;
        return (a.range ?? '').localeCompare(b.range ?? '');
    }
  });
}

// 필터 적용 for Assigns
export function filterAssigns(assigns: Assign[], filters: Filters, searchTerm: string, sortBy: keyof Assign): Assign[] {
  const { courseTitles, submitStatuses } = filters;
  const term = searchTerm.toLowerCase();

  const data = assigns.filter((assign) => {
    if (!matchesBase(assign, courseTitles, term)) return false;
    if (submitStatuses && submitStatuses.length > 0 && !submitStatuses.includes(assign.isSubmit)) return false;
    return true;
  });

  return data.sort((a, b) => {
    // 미제출 우선 배치
    if (!a.isSubmit && b.isSubmit) return -1;
    if (a.isSubmit && !b.isSubmit) return 1;

    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      default: {
        const dateA = a.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(a.dueDate).getTime();
        const dateB = b.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return 0;
      }
    }
  });
}

// 필터 적용 for Quizzes
export function filterQuizzes(quizzes: Quiz[], filters: Filters, searchTerm: string, sortBy: keyof Quiz): Quiz[] {
  const { courseTitles } = filters;
  const term = searchTerm.toLowerCase();

  const data = quizzes.filter((quiz) => matchesBase(quiz, courseTitles, term));

  return data.sort((a, b) => {
    // 미제출 우선 배치
    if (!a.isSubmit && b.isSubmit) return -1;
    if (a.isSubmit && !b.isSubmit) return 1;

    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      default: {
        const dateA = a.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(a.dueDate).getTime();
        const dateB = b.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return 0;
      }
    }
  });
}
