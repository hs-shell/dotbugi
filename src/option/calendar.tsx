import React, { useState, useMemo, useEffect } from 'react';
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
import {
  getOAuthToken,
  addCalendarEvent,
  getCalendarEvents,
  convertCalendarEventsToGoogleEvents,
  GoogleCalendarEvent,
} from '@/lib/calendarUtils';
import { toast } from '@/hooks/use-toast';
import { loadDataFromStorage } from '@/lib/storage';
import GoogleCalendar from '@/assets/calendar.png';
function isSameDate(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isInEventRange(day: Date, event: CalendarEvent) {
  if (!event.start || !event.end) return false;
  return day >= event.start && day <= event.end;
}

function isSingleDayEvent(event: CalendarEvent) {
  if (!event.start || !event.end) return false;
  return isSameDate(event.start, event.end);
}

function getRangePosition(day: Date, event: CalendarEvent): 'single' | 'start' | 'middle' | 'end' | 'after' | null {
  if (!event.start || !event.end) return null;

  if (!isInEventRange(day, event)) return null;
  if (isSingleDayEvent(event)) return 'single';
  if (isSameDate(day, addDays(event.start, 1))) return 'after';
  if (isSameDate(day, event.start)) return 'start';
  if (isSameDate(day, event.end)) return 'end';
  return 'middle';
}

function eventsOverlap(a: CalendarEvent, b: CalendarEvent) {
  if (a.start === null || a.end === null || b.start === null || b.end === null) {
    return false;
  }
  return a.start <= b.end && b.start <= a.end;
}
// 헬퍼: hex 색상을 rgba 문자열로 변환 (투명도 적용)
function hexToRgba(hex: string, opacity: number): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

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

  // 필터 state 관리
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const typeFilters = [
    { value: 'vod', label: '동영상 강의' },
    { value: 'assign', label: '과제' },
    { value: 'quiz', label: '퀴즈' },
  ];

  const titleFilters = Array.from(new Set(events.map((event) => event.title))).map((title) => ({
    value: title,
    label: title,
  }));

  const filterOptions = [...typeFilters, ...titleFilters];

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const isFilterSet = selectedFilters.length > 0;

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

  const eventsWithRow = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const aTime = a.start ? a.start.getTime() : Number.MIN_SAFE_INTEGER;
      const bTime = b.start ? b.start.getTime() : Number.MIN_SAFE_INTEGER;
      return aTime - bTime;
    });

    const assigned: CalendarEventWithRow[] = [];
    for (const event of sorted) {
      let row = 0;
      while (assigned.some((e) => e.row === row && eventsOverlap(e, event))) {
        row++;
      }
      assigned.push({ ...event, row });
    }
    return assigned;
  }, [events]);

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

  // 저장소에서 강의 색상 데이터 불러오기 (vod 데이터에 적용)
  const [courseColors, setCourseColors] = useState<{
    [courseId: string]: { color: string; colorType: string; gradient?: string; opacity: number };
  } | null>(null);

  useEffect(() => {
    loadDataFromStorage('courseColors', (data: string | null) => {
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          const map = Array.isArray(parsedData)
            ? parsedData.reduce(
                (acc, cur) => {
                  acc[cur.courseId] = cur;
                  return acc;
                },
                {} as { [courseId: string]: { color: string; colorType: string; gradient?: string; opacity: number } }
              )
            : {};
          setCourseColors(map);
        } catch (error) {
          console.error('courseColors 파싱 에러:', error);
        }
      }
    });
  }, []);

  const renderEvents = (day: Date, isCurrent: boolean) => {
    const weekStart = startOfWeek(day, { weekStartsOn: 0 });
    const weekEnd = addDays(weekStart, 6);

    const weekEvents = eventsWithRow.filter(
      (event) => event.end !== null && event.start !== null && event.end >= weekStart && event.start <= weekEnd
    );

    const weekStack: { [eventId: string]: number } = {};
    weekEvents
      .sort((a, b) => {
        const aTime = a.start ? a.start.getTime() : Number.MIN_SAFE_INTEGER;
        const bTime = b.start ? b.start.getTime() : Number.MIN_SAFE_INTEGER;
        return aTime - bTime;
      })
      .forEach((event) => {
        let row = 0;
        while (
          Object.entries(weekStack).some(([id, assignedRow]) => {
            if (id === event.id) return false;
            const assignedEvent = weekEvents.find((e) => e.id === id);
            if (!assignedEvent) return false;
            const eventStartInWeek = event.start ? (event.start < weekStart ? weekStart : event.start) : weekStart;
            const eventEndInWeek = event.end ? (event.end > weekEnd ? weekEnd : event.end) : weekEnd;
            const assignedStartInWeek = assignedEvent.start
              ? assignedEvent.start < weekStart
                ? weekStart
                : assignedEvent.start
              : weekStart;
            const assignedEndInWeek = assignedEvent.end
              ? assignedEvent.end > weekEnd
                ? weekEnd
                : assignedEvent.end
              : weekEnd;

            return (
              assignedRow === row && eventStartInWeek <= assignedEndInWeek && assignedStartInWeek <= eventEndInWeek
            );
          })
        ) {
          row++;
        }
        weekStack[event.id] = row;
      });

    const typeFilterValues = typeFilters.map((f) => f.value);
    const selectedTypeFilters = selectedFilters.filter((f) => typeFilterValues.includes(f));
    const selectedTitleFilters = selectedFilters.filter((f) => !typeFilterValues.includes(f));

    const eventsOfTheDay = eventsWithRow
      .filter((event) => {
        if (!isInEventRange(day, event)) return false;
        if (selectedTypeFilters.length > 0 && selectedTitleFilters.length > 0) {
          return selectedTypeFilters.includes(event.type) && selectedTitleFilters.includes(event.title);
        } else if (selectedTypeFilters.length > 0) {
          return selectedTypeFilters.includes(event.type);
        } else if (selectedTitleFilters.length > 0) {
          return selectedTitleFilters.includes(event.title);
        }
        return true;
      })
      .map((event) => ({ ...event, row: weekStack[event.id] ?? 0 }));

    const maxRow = eventsOfTheDay.length > 0 ? Math.max(...eventsOfTheDay.map((e) => e.row)) : -1;
    const numRows = maxRow + 1;

    return (
      <div className="flex flex-col gap-1 mt-1 w-full">
        {Array.from({ length: numRows }, (_, rowIndex) => {
          const event = eventsOfTheDay.find((e) => e.row === rowIndex);
          if (event) {
            const rangePosition = getRangePosition(day, event);
            if (!rangePosition) return <div key={rowIndex} className="h-6" />;

            const eventId = event.id.split('-')[0];
            const isVodCustom = event.type === 'vod' && courseColors && eventId && courseColors[eventId];
            let customStyle = {};

            if (isVodCustom) {
              const courseData = courseColors?.[eventId];

              const eventStart = event.start ?? new Date(0);
              const eventEnd = event.end ?? new Date(0);

              const totalDays = Math.floor((eventEnd.getTime() - eventStart.getTime()) / (1000 * 3600 * 24)) + 1;

              if (courseData?.colorType === 'gradient' && courseData.gradient && totalDays > 1) {
                const dayIndex = Math.floor((day.getTime() - eventStart.getTime()) / (1000 * 3600 * 24));

                const regex = /linear-gradient\(to right, (#[0-9a-fA-F]+), (#[0-9a-fA-F]+)\)/;
                const match = courseData.gradient.match(regex);

                if (match) {
                  const rgba1 = hexToRgba(match[1], courseData.opacity);
                  const rgba2 = hexToRgba(match[2], courseData.opacity);
                  customStyle = {
                    backgroundImage: `linear-gradient(to right, ${rgba1}, ${rgba2})`,
                    backgroundSize: `${totalDays * 100}% 100%`,
                    backgroundPosition: `${-(dayIndex * 100)}% 0`,
                  };
                } else {
                  customStyle = { backgroundImage: courseData.gradient, opacity: courseData.opacity };
                }
              } else {
                // 단색(hex)인 경우: null 값 방지 후 rgba 변환
                customStyle = { background: hexToRgba(courseData?.color ?? '#000000', courseData?.opacity ?? 1) };
              }
            }

            if (rangePosition === 'single') {
              return (
                <div key={rowIndex} className="flex items-center px-1 h-6 w-full">
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

            const additionalClasses = cn(isStart && 'rounded-l-sm ml-1', isEnd && 'rounded-r-sm mr-1');

            const defaultClass = isVodCustom
              ? ''
              : isCurrent
                ? `${subjectColorMap[event.title]} text-zinc-700`
                : 'bg-zinc-100 text-zinc-300';

            return (
              <div
                key={rowIndex}
                style={customStyle}
                className={cn(defaultClass, 'relative h-6 flex items-center justify-start z-10', additionalClasses)}
              >
                {showTitle && (
                  <span className="ml-1 text-xs font-medium line-clamp-1 text-ellipsis px-1 overflow-hidden">
                    {event.title} - {event.subject}
                  </span>
                )}
              </div>
            );
          } else {
            return <div key={rowIndex} className="h-6" />;
          }
        })}
      </div>
    );
  };

  const handleRedirectToCalendar = async () => {
    const token = await getOAuthToken();
    if (!token) {
      toast({
        title: '동기화 실패 🚨',
        description: '구글 캘린더 연동 상태를 확인해주세요',
        variant: 'destructive',
      });
      return;
    }

    window.open('https://calendar.google.com/calendar', '_blank');
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
      <div className="grid grid-cols-3 items-center  my-8 gap-4">
        <div className="flex justify-start">
          <button
            className="flex justify-self-end rounded-lg gap-1 bg-white hover:bg-zinc-100 transition-all duration-200 mt-2 mb-2 ml-2 py-3 px-5"
            onClick={handleRedirectToCalendar}
          >
            <img src={GoogleCalendar} className="w-6 h-6 p-0" />
          </button>
        </div>
        <div className="flex justify-center items-center gap-4">
          <Button variant="ghost" onClick={handlePrevMonth}>
            <ChevronLeft />
          </Button>
          <div className="font-semibold text-lg">{format(currentMonth, 'yyyy년 MM월')}</div>
          <Button variant="ghost" onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>

        <div className="flex justify-end">
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
                className={`text-sm px-4 justify-self-end ${
                  isTodayDate
                    ? 'text-blue-600 font-semibold'
                    : !isTodayDate && isCurrent && sunday
                      ? 'text-red-700'
                      : ''
                }`}
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
