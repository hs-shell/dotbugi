import { Vod, Assign, Quiz, Filters } from '@/content/types';
import { isAttended } from './utils';

// 필터 적용 for VODs
export function filterVods(vods: Vod[], filters: Filters, searchTerm: string, sortBy: keyof Vod): Vod[] {
  const { courseTitles, attendanceStatuses } = filters;
  const term = searchTerm.toLowerCase();

  const data = vods.filter((vod) => {
    if (courseTitles.length > 0 && !courseTitles.includes(vod.courseTitle)) return false;
    if (attendanceStatuses && attendanceStatuses.length > 0) {
      const status = isAttended(vod.isAttendance) ? '출석' : '결석';
      if (!attendanceStatuses.includes(status)) return false;
    }
    if (term && !vod.courseTitle.toLowerCase().includes(term) && !vod.title.toLowerCase().includes(term) && !vod.prof.toLowerCase().includes(term)) return false;
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
    if (courseTitles.length > 0 && !courseTitles.includes(assign.courseTitle)) return false;
    if (submitStatuses && submitStatuses.length > 0 && !submitStatuses.includes(assign.isSubmit)) return false;
    if (term && !assign.courseTitle.toLowerCase().includes(term) && !assign.title.toLowerCase().includes(term) && !assign.prof.toLowerCase().includes(term)) return false;
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

  const data = quizzes.filter((quiz) => {
    if (courseTitles.length > 0 && !courseTitles.includes(quiz.courseTitle)) return false;
    if (term && !quiz.courseTitle.toLowerCase().includes(term) && !quiz.title.toLowerCase().includes(term) && !quiz.prof.toLowerCase().includes(term)) return false;
    return true;
  });

  return data.sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        if (a.dueDate === null && b.dueDate !== null) return 1;
        if (a.dueDate !== null && b.dueDate === null) return -1;
        if (a.dueDate === null && b.dueDate === null) return 0;
        return (a.dueDate ?? '').localeCompare(b.dueDate ?? '');
    }
  });
}
