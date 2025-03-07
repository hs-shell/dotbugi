import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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
  isSunday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, NotebookText, Zap, ListFilter, CalendarArrowUp } from 'lucide-react';
import useCalendarEvents, { CalendarEvent } from '@/hooks/useCalendarEvents';
import filter from '@/assets/filter.svg';
import { Label } from '@/components/ui/label';

// 새 이벤트 동기화 관련 유틸리티 함수 (각자 환경에 맞게 구현)
import {
  getOAuthToken,
  addCalendarEvent,
  getCalendarEvents,
  convertCalendarEventsToGoogleEvents,
  GoogleCalendarEvent,
} from '@/lib/calendarUtils';
import { toast } from '@/hooks/use-toast';

// 날짜 비교
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

// 범위 이벤트에서 현재 day의 위치 판별
function getRangePosition(day: Date, event: CalendarEvent): 'single' | 'start' | 'middle' | 'end' | 'after' | null {
  if (!isInEventRange(day, event)) return null;
  if (isSingleDayEvent(event)) return 'single';
  if (isSameDate(day, addDays(event.start, 1))) return 'after';
  if (isSameDate(day, event.start)) return 'start';
  if (isSameDate(day, event.end)) return 'end';
  return 'middle';
}

// 이벤트 간 겹침 여부 (두 이벤트의 기간이 겹치면 true)
function eventsOverlap(a: CalendarEvent, b: CalendarEvent) {
  return a.start <= b.end && b.start <= a.end;
}

// row 배정을 위해 CalendarEvent에 row 속성을 추가한 타입 정의
interface CalendarEventWithRow extends CalendarEvent {
  row: number;
}

const colorClasses = [
  'bg-rose-100 text-rose-800',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-fuchsia-100 text-fuchsia-800',
  'bg-lime-100 text-lime-800',
  'bg-cyan-100 text-cyan-800',
];

export function Calendar() {
  const events = useCalendarEvents();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 필터 state 관리 (체크된 필터는 문자열 배열로 관리)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  // Popover 열림/닫힘 상태
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // type별 기본 필터 항목
  const typeFilters = [
    { value: 'vod', label: '동영상 강의' },
    { value: 'assign', label: '과제' },
    { value: 'quiz', label: '퀴즈' },
  ];

  // 이벤트의 title들을 중복 없이 필터 항목에 추가
  const titleFilters = Array.from(new Set(events.map((event) => event.title))).map((title) => ({
    value: title,
    label: title,
  }));

  // type 필터와 title 필터를 합치기 (중복 없이)
  const filterOptions = [...typeFilters, ...titleFilters];

  // 토글 함수: 선택한 필터가 있으면 제거, 없으면 추가
  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  // 필터가 하나라도 설정되어 있는지 (아이콘 표시 용도)
  const isFilterSet = selectedFilters.length > 0;

  // 달력 관련 계산
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  const dayList = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (isSameMonth(date, currentMonth)) {
      setSelectedDate(date);
    } else {
      if (isBefore(date, firstDayOfMonth)) {
        handlePrevMonth();
      } else {
        handleNextMonth();
      }
      setSelectedDate(date);
    }
  };

  // ── 이벤트에 row 번호를 할당 (겹치는 이벤트는 다른 row에 배치) ──
  const eventsWithRow = useMemo(() => {
    // 날짜 기준 오름차순 정렬
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const assigned: CalendarEventWithRow[] = [];
    for (const event of sorted) {
      let row = 0;
      // 이미 배정된 이벤트 중 같은 row에 있으며 겹치는 이벤트가 있으면 row 증가
      while (assigned.some((e) => e.row === row && eventsOverlap(e, event))) {
        row++;
      }
      assigned.push({ ...event, row });
    }
    return assigned;
  }, [events]);

  // subject 별 색상 매핑 (이전과 동일하게 event.title 기준)
  const subjectList = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.title)));
  }, [events]);

  const subjectColorMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    subjectList.forEach((subject, index) => {
      map[subject] = colorClasses[index % colorClasses.length];
    });
    return map;
  }, [subjectList]);

  // 날짜에 해당하는 이벤트들을 row 번호 기준으로 렌더링
  const renderEvents = (day: Date, isCurrent: boolean) => {
    const typeFilterValues = typeFilters.map((f) => f.value);
    const selectedTypeFilters = selectedFilters.filter((f) => typeFilterValues.includes(f));
    const selectedTitleFilters = selectedFilters.filter((f) => !typeFilterValues.includes(f));

    // 필터 적용
    const eventsOfTheDay = eventsWithRow.filter((event) => {
      if (!isInEventRange(day, event)) return false;
      if (selectedTypeFilters.length > 0 && selectedTitleFilters.length > 0) {
        return selectedTypeFilters.includes(event.type) && selectedTitleFilters.includes(event.title);
      } else if (selectedTypeFilters.length > 0) {
        return selectedTypeFilters.includes(event.type);
      } else if (selectedTitleFilters.length > 0) {
        return selectedTitleFilters.includes(event.title);
      }
      return true;
    });

    // 해당 날짜에서 할당된 row 최대값 (없으면 최소 0행)
    const maxRow = eventsOfTheDay.length > 0 ? Math.max(...eventsOfTheDay.map((e) => e.row)) : -1;
    const numRows = maxRow + 1;

    return (
      <div className="flex flex-col gap-1 mt-1 w-full">
        {Array.from({ length: numRows }, (_, rowIndex) => {
          // 해당 row에 있는 이벤트 찾기
          const event = eventsOfTheDay.find((e) => e.row === rowIndex);
          if (event) {
            const rangePosition = getRangePosition(day, event);
            if (!rangePosition) return <div key={rowIndex} className="h-4" />;
            if (rangePosition === 'single') {
              return (
                <div key={rowIndex} className="flex items-center px-1 w-full">
                  <span className="px-0.5 flex-shrink-0">
                    {event.type === 'assign' ? (
                      <NotebookText className={`w-3 h-3 ${isCurrent ? 'text-violet-900' : ''}`} />
                    ) : event.type === 'quiz' ? (
                      <Zap className={`w-3 h-3 ${isCurrent ? 'text-amber-500' : ''}`} />
                    ) : null}
                  </span>
                  <span className="flex-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
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
                key={rowIndex}
                className={cn(
                  isCurrent ? `${subjectColorMap[event.title]} text-zinc-700` : 'bg-zinc-100 text-zinc-300',
                  'relative h-4 flex items-center justify-start z-10',
                  isStart && 'rounded-l-sm ml-1',
                  isEnd && 'rounded-r-sm mr-1'
                )}
              >
                {showTitle && (
                  <span className="ml-1 text-xs font-medium line-clamp-1 text-ellipsis px-1 overflow-hidden">
                    {event.title} - {event.subject}
                  </span>
                )}
              </div>
            );
          } else {
            // 해당 row에 이벤트가 없으면 빈 자리
            return <div key={rowIndex} className="h-4" />;
          }
        })}
      </div>
    );
  };

  const handleCalendarSync = async () => {
    const token = await getOAuthToken();
    if (!token) {
      toast({
        title: '동기화 실패 🚨',
        description: '구글 캘린더 연동 상태를 확인해주세요',
        variant: 'destructive',
      });
      return;
    }

    try {
      const existingEvents: GoogleCalendarEvent[] = await getCalendarEvents(token);

      const newEventsData: GoogleCalendarEvent[] = convertCalendarEventsToGoogleEvents(events);

      const normalizeEvent = (event: {
        summary: string;
        description?: string;
        start: { dateTime: string };
        end: { dateTime: string };
      }) => ({
        summary: event.summary.trim().toLowerCase(),
        description: (event.description || '').trim().toLowerCase(),
        startTime: new Date(event.start.dateTime).getTime(),
        endTime: new Date(event.end.dateTime).getTime(),
      });

      const uniqueNewEvents = newEventsData.filter((newEvent) => {
        const normNew = normalizeEvent(newEvent);
        return !existingEvents.some((existingEvent) => {
          const normExisting = normalizeEvent(existingEvent);
          return (
            normExisting.summary === normNew.summary &&
            normExisting.description === normNew.description &&
            normExisting.startTime === normNew.startTime &&
            normExisting.endTime === normNew.endTime
          );
        });
      });

      console.log(existingEvents, uniqueNewEvents);

      if (uniqueNewEvents.length === 0) {
        toast({
          title: '캘린더가 최신 상태입니다 🤩',
          description: '이미 최신 정보로 동기화되었습니다.',
          variant: 'default',
        });
      } else {
        for (const event of uniqueNewEvents) {
          await addCalendarEvent(event, token);
        }
        toast({
          title: '동기화 성공 🚀',
          description: `${uniqueNewEvents.length}개의 이벤트가 추가되었습니다.`,
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: '동기화 오류 🚨',
        description: '이벤트 동기화 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  return (
    <Card className="px-4 p-0 w-full border-none shadow-none">
      <div className="flex items-center justify-between my-8 gap-4">
        <div />
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handlePrevMonth}>
            <ChevronLeft />
          </Button>
          <div className="font-semibold text-lg">{format(currentMonth, 'yyyy년 MM월')}</div>
          <Button variant="ghost" onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>

        <div className="flex justify-between">
          <div>
            <button
              className="flex justify-self-end rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 mt-2 mb-2 ml-2 py-3 px-5"
              onClick={handleCalendarSync}
            >
              <CalendarArrowUp className="w-5 h-5 p-0" />
            </button>
          </div>
          <div className="flex flex-shrink-0 items-center">
            <Popover open={isFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="flex justify-self-end rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 mt-2 mb-2 mr-5 ml-2 py-3 px-5"
                >
                  {isFilterSet ? (
                    <img src={filter} className="w-5 h-5 p-0" alt="필터 설정됨" />
                  ) : (
                    <ListFilter className="w-5 h-5 p-0" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 shadow-md rounded-xl p-4 space-y-2">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filterOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          id={`filter-${option.value}`}
                          checked={selectedFilters.includes(option.value)}
                          onChange={() => toggleFilter(option.value)}
                          className="shadow-md rounded-sm peer h-5 w-5 cursor-pointer appearance-none border border-zinc-800 bg-white checked:border-primary checked:bg-primary focus:outline-none focus:ring-primary focus:ring-offset-0"
                        />
                        <svg
                          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <Label
                        id={`filter-${option.value}`}
                        className="text-base font-normal text-black cursor-pointer transition-colors line-clamp-1 text-ellipsis"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <Button className="w-full text-base h-8 font-semibold mt-1" variant="outline" onClick={clearFilters}>
                  모두 지우기
                </Button>
                <Button
                  className="w-full text-base h-8 font-semibold"
                  variant="default"
                  onClick={() => setIsFilterOpen(false)}
                >
                  닫기
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((dayName) => (
          <div key={dayName} className={`text-sm ${dayName === '일' ? 'text-red-700' : ''}`}>
            {dayName}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 transition-all duration-500">
        {dayList.map((dayItem) => {
          const isCurrent = isSameMonth(dayItem, currentMonth);
          const isTodayDate = isToday(dayItem);
          const sunday = isSunday(dayItem);
          const isSelected = selectedDate && isSameDate(selectedDate, dayItem);
          return (
            <div
              key={dayItem.toISOString()}
              onClick={() => handleSelectDate(dayItem)}
              className={cn(
                'relative cursor-pointer w-full min-h-[120px] py-2 rounded-lg',
                isCurrent ? 'bg-white' : 'text-gray-300',
                isTodayDate && 'text-blue-600 font-semibold',
                isSelected && 'bg-zinc-50',
                'hover:bg-zinc-50 transition-all duration-300'
              )}
            >
              <div
                className={cn(
                  'absolute top-0 rounded-md left-1 right-1',
                  isTodayDate ? 'border-t-1.5 border-blue-600' : 'border-t-1.5 border-zinc-200'
                )}
              />
              <div
                className={`text-sm px-4 justify-self-end ${!isTodayDate && isCurrent && sunday ? 'text-red-700' : ''}`}
              >
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
