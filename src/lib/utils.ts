import { TimeDifferenceResult } from '@/content/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // 차이를 일(day)로 변환
  return diffDays <= 7 && diffDays >= 0;
}

export const calculateTimeDifference = (timeRange: string | null): TimeDifferenceResult => {
  if (!timeRange) {
    return {
      message: `정보없음`,
      borderColor: 'border-amber-500',
      borderLeftColor: 'border-l-amber-500',
      textColor: 'text-amber-500',
    };
  }

  const now = new Date();
  const [startString, endString] = timeRange.split(' ~ ');
  const startDate = new Date(startString);
  const endDate = new Date(endString);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { message: 'Invalid date format', borderColor: 'gray', borderLeftColor: 'gray', textColor: 'black' };
  }

  if (now < endDate) {
    const timeDiff = endDate.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days >= 1) {
      return {
        message: `${days}일 후`,
        borderColor: 'border-amber-500',
        borderLeftColor: 'border-l-amber-500',
        textColor: 'text-amber-500',
      };
    } else {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor(timeDiff / (1000 * 60));
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
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days >= 1) {
      return {
        message: `${days}일 후`,
        borderColor: 'border-amber-500',
        borderLeftColor: 'border-l-amber-500',
        textColor: 'text-amber-500',
      };
    } else {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor(timeDiff / (1000 * 60));
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

export const calculateRemainingTimeByRange = (range: string | null) => {
  if (!range) return '정보없음';
  const [startDateStr, endDateStr] = range.split(' ~ ');
  const endDate = new Date(endDateStr);

  const now = new Date();

  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (daysLeft < 0 || hoursLeft < 0 || minutesLeft < 0) return `마감`;
  return `${daysLeft === 0 ? '' : daysLeft + '일'} ${hoursLeft === 0 ? '' : hoursLeft + '시간'} ${minutesLeft}분 남음`;
};

export const calculateRemainingTime = (endTime: string | null) => {
  if (!endTime) return '정보없음';
  const endDate = new Date(endTime);

  const now = new Date();

  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (daysLeft < 0 || hoursLeft < 0 || minutesLeft < 0) return `마감`;
  return `${daysLeft === 0 ? '' : daysLeft + '일'} ${hoursLeft === 0 ? '' : hoursLeft + '시간'} ${minutesLeft}분 남음`;
};

export const removeSquareBrackets = (str: string) => {
  return str.replace(/\[[^\]]*\]/g, '');
};

export const TimeAgo = (givenTimestamp: number) => {
  const now = Date.now();
  const diffMs = now - givenTimestamp;

  // 각 단위별 밀리초
  const msPerMinute = 1000 * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  // 차이를 일, 시간, 분 단위로 계산
  const days = Math.floor(diffMs / msPerDay);
  const hours = Math.floor((diffMs % msPerDay) / msPerHour);
  const minutes = Math.floor((diffMs % msPerHour) / msPerMinute);
  if (days === 0 && hours === 0 && minutes === 0) return '지금 막';
  return `${days !== 0 ? days + '일 ' : ''}${hours !== 0 ? hours + '시간 ' : ''}${minutes !== 0 ? minutes + '분 전' : '전'}`;
};
