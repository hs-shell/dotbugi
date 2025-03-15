import { Vod, Assign, Quiz, Filters } from '@/content/types';

// 필터 적용 for VODs
export function filterVods(vods: Vod[], filters: Filters, searchTerm: string, sortBy: keyof Vod): Vod[] {
  let data = vods;

  const { courseTitles, attendanceStatuses } = filters;

  if (courseTitles.length > 0) {
    data = data.filter((vod) => courseTitles.includes(vod.courseTitle));
  }

  if (attendanceStatuses && attendanceStatuses.length > 0) {
    data = data.filter((vod) => {
      const status = vod.isAttendance.toLowerCase().trim() === 'o' ? '출석' : '결석';
      return attendanceStatuses.includes(status);
    });
  }

  if (searchTerm !== '') {
    data = data.filter(
      (item) =>
        item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prof.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return data.sort((a, b) => {
    const attendanceA = a.isAttendance.toLowerCase().trim() === 'o';
    const attendanceB = b.isAttendance.toLowerCase().trim() === 'o';

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
  let data = assigns;

  const { courseTitles, submitStatuses } = filters;

  if (courseTitles.length > 0) {
    data = data.filter((assign) => courseTitles.includes(assign.courseTitle));
  }

  if (submitStatuses && submitStatuses.length > 0) {
    data = data.filter((assign) => submitStatuses.includes(assign.isSubmit));
  }

  if (searchTerm !== '') {
    data = data.filter(
      (item) =>
        item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prof.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return data.sort((a, b) => {
    if (a.isSubmit !== b.isSubmit) {
      return a.isSubmit ? -1 : 1;
    }

    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        if (a.dueDate === null && b.dueDate !== null) return a.isSubmit ? -1 : 1;
        if (a.dueDate !== null && b.dueDate === null) return a.isSubmit ? 1 : -1;
        if (a.dueDate === null && b.dueDate === null) return 0;
        return (a.dueDate ?? '').localeCompare(b.dueDate ?? '');
    }
  });
}

// 필터 적용 for Quizes
export function filterQuizes(quizes: Quiz[], filters: Filters, searchTerm: string, sortBy: keyof Quiz): Quiz[] {
  let data = quizes;

  const { courseTitles } = filters;

  if (courseTitles.length > 0) {
    data = data.filter((quiz) => courseTitles.includes(quiz.courseTitle));
  }

  if (searchTerm !== '') {
    data = data.filter(
      (item) =>
        item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prof.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

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
