import { TimeDifferenceResult } from '@/content/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAttended(value: string) {
  return value.toLowerCase().trim() === 'o';
}

export function isAbsent(value: string) {
  return value.toUpperCase().startsWith('X');
}

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

export function isCurrentDateInRange(dateRange: string | null) {
  if (!dateRange || !dateRange.includes(' ~ ')) {
    return false;
  }

  const [startStr, endStr] = dateRange.split(' ~ ');

  if (!startStr || !endStr) {
    return false;
  }

  const startDate = new Date(startStr.replace(/-/g, '/'));
  const endDate = new Date(endStr.replace(/-/g, '/'));

  const currentDate = new Date();

  return currentDate >= startDate && currentDate <= endDate;
}

export function isCurrentDateByDate(date: string | null) {
  if (!date || date.length <= 1) return false;
  const endDate = new Date(date);
  const currentDate = new Date();
  return currentDate <= endDate;
}

export function isWithinSevenDays(date: string) {
  const dueDate = new Date(date); // 문자열을 Date 객체로 변환
  const now = new Date(); // 현재 날짜
  const diffTime = dueDate.getTime() - now.getTime(); // 두 날짜의 차이 (밀리초)
  const diffDays = diffTime / MS_PER_DAY;
  return diffDays <= 7 && diffDays >= 0;
}

export const extractEndDate = (range: string | null): string | null => {
  if (!range) return null;
  const parts = range.split(' ~ ');
  return parts[1] ?? null;
};

export const calculateDueDate = (dueDate: string | null): TimeDifferenceResult => {
  if (!dueDate) {
    return {
      message: `정보없음`,
      borderColor: 'border-amber-500',
      borderLeftColor: 'border-l-amber-500',
      textColor: 'text-amber-500',
    };
  }

  const now = new Date();
  const endDate = new Date(dueDate);

  if (isNaN(endDate.getTime())) {
    return { message: 'Invalid date format', borderColor: 'gray', borderLeftColor: 'gray', textColor: 'black' };
  }

  if (now < endDate) {
    const timeDiff = endDate.getTime() - now.getTime();
    const days = Math.floor(timeDiff / MS_PER_DAY);

    if (days >= 1) {
      return {
        message: `${days}일 후`,
        borderColor: 'border-amber-500',
        borderLeftColor: 'border-l-amber-500',
        textColor: 'text-amber-500',
      };
    } else {
      const hours = Math.floor(timeDiff / MS_PER_HOUR);
      const minutes = Math.floor(timeDiff / MS_PER_MINUTE);
      return {
        message: `${hours !== 0 ? `${hours}시간 후` : `${minutes}분 후`}`,
        borderColor: 'border-red-700',
        borderLeftColor: 'border-l-red-700',
        textColor: 'text-red-700',
      };
    }
  } else {
    return {
      message: '마감',
      borderColor: 'border-red-950',
      borderLeftColor: 'border-l-red-950',
      textColor: 'text-red-950',
    };
  }
};

export const formatDateString = (input: string | null) => {
  if (!input) return '기한없음';
  const regex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}):\d{2} ~ (\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}):\d{2}/;

  const formatted = input.replace(
    regex,
    (_, year1, month1, day1, time1, year2, month2, day2, time2) =>
      `${year1.slice(2)}.${month1}.${day1} ${time1} ~ ${year2.slice(2)}.${month2}.${day2} ${time2}`
  );

  return formatted;
};

export const calculateRemainingTime = (endTime: string | null) => {
  if (!endTime) return '정보없음';
  const endDate = new Date(endTime);

  const now = new Date();

  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.floor(timeDiff / MS_PER_DAY);
  const hoursLeft = Math.floor((timeDiff % MS_PER_DAY) / MS_PER_HOUR);
  const minutesLeft = Math.floor((timeDiff % MS_PER_HOUR) / MS_PER_MINUTE);

  if (daysLeft < 0 || hoursLeft < 0 || minutesLeft < 0) return `마감`;
  return `${daysLeft === 0 ? '' : daysLeft + '일'} ${hoursLeft === 0 ? '' : hoursLeft + '시간'} ${minutesLeft}분 남음`;
};

export const removeSquareBrackets = (str: string) => {
  return str.replace(/\[[^\]]*\]/g, '');
};

export const TimeAgo = (givenTimestamp: number) => {
  const now = Date.now();
  const diffMs = now - givenTimestamp;

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);
  if (days === 0 && hours === 0 && minutes === 0) return '지금 막';
  return `${days !== 0 ? days + '일 ' : ''}${hours !== 0 ? hours + '시간 ' : ''}${minutes !== 0 ? minutes + '분 전' : '전'}`;
};
