import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, removeSquareBrackets } from '@/lib/utils';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  isToday,
  isBefore,
  addDays,
  isSameDay,
  startOfDay,
  isSunday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Dot, NotebookText, Zap } from 'lucide-react';
import useCalendarEvents, { CalendarEvent } from '@/hooks/useCalendarEvents';

// 날짜가 동일한지 비교
function isSameDate(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

// day가 이벤트 구간에 포함되는지 검사
function isInEventRange(day: Date, event: CalendarEvent) {
  return day >= event.start && day <= event.end;
}

// 이벤트가 단일 날짜인지
function isSingleDayEvent(event: CalendarEvent) {
  return isSameDate(event.start, event.end);
}

// 범위 이벤트에서 현재 day가 start인지, middle인지, end인지, single인지 판별
function getRangePosition(day: Date, event: CalendarEvent): 'single' | 'start' | 'middle' | 'end' | 'after' | null {
  if (!isInEventRange(day, event)) return null;
  if (isSingleDayEvent(event)) return 'single';
  if (isSameDate(day, addDays(event.start, 1))) return 'after';
  if (isSameDate(day, event.start)) return 'start';
  if (isSameDate(day, event.end)) return 'end';
  return 'middle';
}

const colorClasses = [
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-yellow-100 text-yellow-700',
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
];

export function Calendar() {
  const events = useCalendarEvents();
  // const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // 현재 월의 첫 날
  const firstDayOfMonth = startOfMonth(currentMonth);
  // 달력 상에서 "6주"를 강제로 보여주기 위해, 해당 월의 첫 주의 시작일을 구함
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });

  // 총 42일(6주)을 미리 배열로 만들어 둔다
  const dayList = React.useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  // 이전 달 버튼
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  // 다음 달 버튼
  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // 날짜 선택 또는 이전/다음 달로 이동
  const handleSelectDate = (date: Date) => {
    // 현재 달 안의 날짜라면 그냥 선택만
    if (isSameMonth(date, currentMonth)) {
      setSelectedDate(date);
    } else {
      // 이전 달 날짜 셀을 눌렀다면 이전 달로 이동
      if (isBefore(date, firstDayOfMonth)) {
        handlePrevMonth();
      } else {
        // 다음 달 날짜 셀을 눌렀다면 다음 달로 이동
        handleNextMonth();
      }
      // 선택 날짜 갱신
      setSelectedDate(date);
    }
  };

  // 날짜 셀에 표시할 이벤트들 렌더링
  const renderEvents = (day: Date, isCurrent: boolean) => {
    const eventsOfTheDay = events.filter((e) => isInEventRange(day, e));
    if (eventsOfTheDay.length === 0) return null;

    return (
      <div className="flex flex-col gap-1 mt-1 w-full">
        {eventsOfTheDay.map((event, index) => {
          const rangePosition = getRangePosition(day, event);
          if (!rangePosition) return null;

          if (rangePosition === 'single') {
            return (
              <div key={event.id} className="flex items-center px-1">
                <span className="px-0.5">
                  {event.type === 'assign' ? (
                    <NotebookText className={`w-3 h-3 ${isCurrent && 'text-violet-900'}`} />
                  ) : (
                    <Zap className={`w-3 h-3 ${isCurrent && 'text-amber-500'}`} />
                  )}
                </span>
                <span className="text-xs text-ellipsis line-clamp-1 overflow-hidden">
                  {event.title} - {event.subject}
                </span>
              </div>
            );
          }

          const isStart = rangePosition === 'start';
          const isEnd = rangePosition === 'end';
          const showTitle = isStart;

          return (
            <div
              key={event.id}
              className={cn(
                isCurrent ? `${colorClasses[index % 8]} text-zinc-700` : 'bg-zinc-100 text-zinc-300',
                'relative h-4 flex items-center justify-start z-10',
                isStart && 'rounded-l-sm pl-1',
                isEnd && 'rounded-r-sm pr-1'
              )}
            >
              {showTitle && (
                <span className="pl-1 text-xs font-medium line-clamp-1 text-ellipsis px-1 overflow-hidden">
                  {event.title} - {event.subject}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-0 w-full max-w-7xl border-none shadow-none">
      <div className="flex items-center justify-center my-8 gap-4 ">
        <Button variant="ghost" onClick={handlePrevMonth}>
          <ChevronLeft />
        </Button>
        <div className="font-semibold text-lg">{format(currentMonth, 'yyyy년 MM월')}</div>
        <Button variant="ghost" onClick={handleNextMonth}>
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((dayName) => (
          <div key={dayName} className={`text-sm ${dayName === '일' && 'text-red-700'}`}>
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 transition-all duration-500">
        {dayList.map((dayItem) => {
          const isCurrent = isSameMonth(dayItem, currentMonth); // 이번 달 날짜인지 여부
          const isTodayDate = isToday(dayItem); // 오늘 날짜인지 여부
          const sunday = isSunday(dayItem);
          const isSelected = selectedDate && isSameDate(selectedDate, dayItem); // 선택된 날짜인지 여부

          return (
            <div
              key={dayItem.toISOString()}
              onClick={() => handleSelectDate(dayItem)}
              className={cn(
                'relative cursor-pointer w-full min-h-[120px] py-2 rounded-lg',
                isCurrent ? 'bg-white' : ' text-gray-300',
                isTodayDate && 'text-blue-600 font-semibold',
                isSelected && 'bg-zinc-50',
                'hover:bg-zinc-50 transition-all duration-300'
              )}
            >
              <div
                className={cn(
                  'absolute top-0 rounded-md left-1 right-1',
                  isTodayDate ? 'border-t-1 border-blue-500' : 'border-t-1 border-zinc-200'
                )}
              />
              <div className={`text-sm px-4 justify-self-end ${isCurrent && sunday && 'text-red-700'}`}>
                {format(dayItem, 'd')}
              </div>

              {renderEvents(dayItem, isCurrent)}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
