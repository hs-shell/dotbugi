import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 하위 호환: 기존 import 경로 유지
export { isAttended, isAbsent } from './attendance';
export {
  isCurrentDateInRange,
  isCurrentDateByDate,
  isWithinSevenDays,
  extractEndDate,
  calculateDueDate,
  calculateRemainingTime,
  timeAgo as TimeAgo,
} from './dateUtils';
export { removeSquareBrackets, formatDateString } from './stringUtils';
