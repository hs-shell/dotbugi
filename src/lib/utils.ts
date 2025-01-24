import { TimeDifferenceResult } from '@/content/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isCurrentDateInRange(dateRange: string) {
  const [startStr, endStr] = dateRange.split(' ~ ');

  const startDate = new Date(startStr.replace(/-/g, '/'));
  const endDate = new Date(endStr.replace(/-/g, '/'));

  const currentDate = new Date();

  return currentDate >= startDate && currentDate <= endDate;
}

export function isWithinSevenDays(date: string) {
  const dueDate = new Date(date); // 문자열을 Date 객체로 변환
  const now = new Date(); // 현재 날짜
  const diffTime = dueDate.getTime() - now.getTime(); // 두 날짜의 차이 (밀리초)
  const diffDays = diffTime / (1000 * 60 * 60 * 24); // 차이를 일(day)로 변환
  return diffDays <= 7 && diffDays >= 0;
}

export const calculateTimeDifference = (timeRange: string): TimeDifferenceResult => {
  const now = new Date();
  const [startString, endString] = timeRange.split(' ~ ');
  const startDate = new Date(startString);
  const endDate = new Date(endString);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { message: 'Invalid date format', borderColor: 'gray', textColor: 'black' };
  }

  if (now < endDate) {
    const timeDiff = endDate.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days >= 1) {
      return { message: `${days}일 후`, borderColor: 'border-amber-500', textColor: 'text-amber-500' };
    } else {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      return { message: `${hours}시간 후`, borderColor: 'border-red-700', textColor: 'text-red-700' };
    }
  } else {
    return { message: '마감', borderColor: 'border-red-950', textColor: 'text-red-950' };
  }
};

export const calculateDueDate = (dueDate: string): TimeDifferenceResult => {
  const now = new Date();
  const endDate = new Date(dueDate);

  if (isNaN(endDate.getTime())) {
    return { message: 'Invalid date format', borderColor: 'gray', textColor: 'black' };
  }

  if (now < endDate) {
    const timeDiff = endDate.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days >= 1) {
      return { message: `${days}일 후`, borderColor: 'border-amber-500', textColor: 'text-amber-500' };
    } else {
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      return { message: `${hours}시간 후`, borderColor: 'border-red-700', textColor: 'text-red-700' };
    }
  } else {
    return { message: '마감', borderColor: 'border-red-950', textColor: 'text-red-950' };
  }
};

export const formatDateString = (input: string) => {
  const regex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}):\d{2} ~ \d{4}-(\d{2})-(\d{2}) (\d{2}:\d{2}):\d{2}/;

  const formatted = input.replace(
    regex,
    (_, year1, month1, day1, time1, month2, day2, time2) =>
      `${year1.slice(2)}.${month1}.${day1} ${time1} ~ ${year1.slice(2)}.${month2}.${day2} ${time2}`
  );

  return formatted;
};

export const calculateRemainingTimeByRange = (range: string) => {
  const [startDateStr, endDateStr] = range.split(' ~ ');
  const endDate = new Date(endDateStr);

  const now = new Date();

  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  return `${daysLeft === 0 ? '' : daysLeft + '일'} ${hoursLeft === 0 ? '' : hoursLeft + '시간'} ${minutesLeft}분 남음`;
};

export const calculateRemainingTime = (endTime: string) => {
  const endDate = new Date(endTime);

  const now = new Date();

  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return `${daysLeft === 0 ? '' : daysLeft + '일'} ${hoursLeft === 0 ? '' : hoursLeft + '시간'} ${minutesLeft}분 남음`;
};
