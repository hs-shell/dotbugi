import { TimeDifferenceResult } from '@/types';

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/** 하이픈 구분 날짜 문자열을 Date로 변환 (Safari 호환) */
export function parseDate(str: string): Date {
  return new Date(str.replace(/-/g, '/'));
}

export function isCurrentDateInRange(dateRange: string | null) {
  if (!dateRange || !dateRange.includes(' ~ ')) return false;

  const [startStr, endStr] = dateRange.split(' ~ ');
  if (!startStr || !endStr) return false;

  const startDate = parseDate(startStr);
  const endDate = parseDate(endStr);
  const now = new Date();

  return now >= startDate && now <= endDate;
}

export function isCurrentDateByDate(date: string | null) {
  if (!date || date.length <= 1) return false;
  return new Date() <= new Date(date);
}

export function isWithinSevenDays(date: string) {
  const diffDays = (new Date(date).getTime() - Date.now()) / MS_PER_DAY;
  return diffDays <= 7 && diffDays >= 0;
}

export function extractEndDate(range: string | null): string | null {
  if (!range) return null;
  return range.split(' ~ ')[1] ?? null;
}

export function calculateDueDate(dueDate: string | null): TimeDifferenceResult {
  if (!dueDate) {
    return { message: '정보없음', borderColor: 'border-amber-500', borderLeftColor: 'border-l-amber-500', textColor: 'text-amber-500' };
  }

  const now = new Date();
  const endDate = new Date(dueDate);

  if (isNaN(endDate.getTime())) {
    return { message: 'Invalid date format', borderColor: 'gray', borderLeftColor: 'gray', textColor: 'black' };
  }

  if (now >= endDate) {
    return { message: '마감', borderColor: 'border-red-950', borderLeftColor: 'border-l-red-950', textColor: 'text-red-950' };
  }

  const timeDiff = endDate.getTime() - now.getTime();
  const days = Math.floor(timeDiff / MS_PER_DAY);

  if (days >= 1) {
    return { message: `${days}일 후`, borderColor: 'border-amber-500', borderLeftColor: 'border-l-amber-500', textColor: 'text-amber-500' };
  }

  const hours = Math.floor(timeDiff / MS_PER_HOUR);
  const minutes = Math.floor(timeDiff / MS_PER_MINUTE);
  return {
    message: hours !== 0 ? `${hours}시간 후` : `${minutes}분 후`,
    borderColor: 'border-red-700',
    borderLeftColor: 'border-l-red-700',
    textColor: 'text-red-700',
  };
}

export function calculateRemainingTime(endTime: string | null) {
  if (!endTime) return '정보없음';

  const timeDiff = new Date(endTime).getTime() - Date.now();
  const daysLeft = Math.floor(timeDiff / MS_PER_DAY);
  const hoursLeft = Math.floor((timeDiff % MS_PER_DAY) / MS_PER_HOUR);
  const minutesLeft = Math.floor((timeDiff % MS_PER_HOUR) / MS_PER_MINUTE);

  if (daysLeft < 0 || hoursLeft < 0 || minutesLeft < 0) return '마감';
  return `${daysLeft === 0 ? '' : daysLeft + '일'} ${hoursLeft === 0 ? '' : hoursLeft + '시간'} ${minutesLeft}분 남음`;
}

export function timeAgo(givenTimestamp: number) {
  const diffMs = Date.now() - givenTimestamp;

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days === 0 && hours === 0 && minutes === 0) return '지금 막';
  return `${days !== 0 ? days + '일 ' : ''}${hours !== 0 ? hours + '시간 ' : ''}${minutes !== 0 ? minutes + '분 전' : '전'}`;
}
