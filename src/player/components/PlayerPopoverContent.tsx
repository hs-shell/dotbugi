import { PopoverContent } from '@radix-ui/react-popover';
import PlayerIframe from './PlayerIframe';
import type { Vod } from '@/content/types';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { loadDataFromStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
// import { isCurrentDateInRange } from '@/lib/utils';

interface PlayerPopoverContentProps {
  isPopoverOpen: boolean;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

export default function PlayerPopoverContent({ isPopoverOpen, isPlaying, setIsPlaying }: PlayerPopoverContentProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [vods, setVods] = useState<Vod[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const [minutes, seconds] = parts.map(Number);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const totalDurationSeconds = useMemo(() => {
    return vods.reduce((sum, vod) => sum + parseTimeToSeconds(vod.length), 0);
  }, [vods]);

  const formatExpectedEndTime = (seconds: number): string => {
    const endTime = new Date(Date.now() + seconds * 1000);
    const month = endTime.getMonth() + 1;
    const date = endTime.getDate();
    const hours = endTime.getHours();
    const minutes = endTime.getMinutes().toString().padStart(2, '0');
    return `${month}/${date} ${hours}:${minutes}`;
  };

  const onNextVideo = useCallback(() => {
    if (currentVideoIndex + 1 >= vods.length) {
      setIsPlaying(false);
      setIsDone(true);
      return;
    }

    setCurrentVideoIndex((prev) => (prev + 1) % vods.length);
  }, [vods, currentVideoIndex, setIsPlaying]);

  useEffect(() => {
    loadDataFromStorage('vod', (data) => {
      if (!data) return;
      setVods([
        {
          courseId: '39689',
          prof: '돋부기',
          courseTitle: '크롬익스텐션',
          week: 4,
          title: '테스트 1',
          isAttendance: 'x',
          weeklyAttendance: 'x',
          length: '10:10',
          range: '2024-12-01 00:00:00 ~ 2028-12-30 23:59:00',
          subject: '1',
          url: 'https://learn.hansung.ac.kr/mod/vod/view.php?id=1086341',
        },
        {
          courseId: '39689',
          prof: '돋부기',
          courseTitle: '크롬익스텐션',
          week: 4,
          title: '테스트 2',
          isAttendance: 'x',
          weeklyAttendance: 'x',
          length: '05:10',
          range: '2024-12-01 00:00:00 ~ 2028-12-30 23:59:00',
          subject: '2',
          url: 'https://learn.hansung.ac.kr/mod/vod/view.php?id=1086348',
        },
      ]);
    });
  }, []);

  useEffect(() => {
    if (isPopoverOpen && !isPlaying && vods.length === 0) {
      loadDataFromStorage('vod', (data) => {
        if (!data) return;

        setVods([
          {
            courseId: '39689',
            prof: '돋부기',
            courseTitle: '크롬익스텐션',
            week: 4,
            title: '테스트 1',
            isAttendance: 'x',
            weeklyAttendance: 'x',
            length: '10:10',
            range: '2024-12-01 00:00:00 ~ 2028-12-30 23:59:00',
            subject: '1',
            url: 'https://learn.hansung.ac.kr/mod/vod/view.php?id=1086341',
          },
          {
            courseId: '39689',
            prof: '돋부기',
            courseTitle: '크롬익스텐션',
            week: 4,
            title: '테스트 2',
            isAttendance: 'x',
            weeklyAttendance: 'x',
            length: '05:10',
            range: '2024-12-01 00:00:00 ~ 2028-12-30 23:59:00',
            subject: '2',
            url: 'https://learn.hansung.ac.kr/mod/vod/view.php?id=1086348',
          },
        ]);
      });
    }
  }, [isPlaying, vods, isPopoverOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = vods.findIndex((v) => `${v.week}-${v.title}` === active.id);
      const newIndex = vods.findIndex((v) => `${v.week}-${v.title}` === over.id);
      setVods((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const autoPlayText =
    isHover && isPlaying
      ? '수강 종료'
      : isPlaying
        ? `${formatExpectedEndTime(totalDurationSeconds)} 완료 예정`
        : isDone
          ? '수강 완료'
          : '수강 시작';

  return (
    <PopoverContent
      side="right"
      sideOffset={8}
      forceMount
      className={`p-0 animate-popover-fade-in transition-opacity border-none bg-transparent ${
        isPopoverOpen ? 'opacity-100 pointer-events-auto -z-50' : 'opacity-0 pointer-events-none z-50'
      }`}
      style={{
        width: 'clamp(400px, 85vw, 900px)',
        height: 'clamp(400px, 80vh, 700px)',
        display: `${isPopoverOpen ? 'block' : 'none'}`,
      }}
    >
      <div className="bg-white rounded-3xl border-none shadow-2xl shadow-zinc-700 w-full h-full flex flex-col p-6 gap-4">
        {vods.length !== 0 ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex w-full overflow-hidden flex-1 min-h-0 space-x-4">
              <div className="w-2/3 flex-shrink-0">
                <PlayerIframe
                  videoSrc={vods[currentVideoIndex]?.url.replace('view', 'viewer')}
                  onNextVideo={onNextVideo}
                  isPlaying={isPlaying}
                />
              </div>

              <div className="w-1/3 flex flex-col py-4 px-4 min-w-0 bg-zinc-50 rounded-xl">
                <h3 className="text-4xl font-bold text-black mb-4 flex-shrink-0">강의 목록</h3>
                <div className="overflow-y-auto flex-1 pr-2 scrollbar-hide">
                  <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={vods.map((v) => `${v.week}-${v.title}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {vods.map((vod, idx) => (
                          <SortableItem
                            key={`${vod.week}-${vod.title}`}
                            vod={vod}
                            idx={idx}
                            currentVideoIndex={currentVideoIndex}
                            setCurrentVideoIndex={setCurrentVideoIndex}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="pt-4">
                  <Button
                    variant={`default`}
                    className={`w-full h-16 text-2xl font-semibold flex items-center justify-center transition-all duration-300 rounded-xl flex-shrink-0 ${
                      isPlaying && 'hover:bg-red-700'
                    }`}
                    onClick={() => setIsPlaying((prev) => !prev)}
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                  >
                    {autoPlayText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full w-full gap-y-2">
            <div className="w-full flex items-center justify-center text-zinc-800 text-3xl font-medium">
              수강할 영상이 없습니다
            </div>
            <div className="w-full flex items-center justify-center text-zinc-500">
              이클래스 돋부기를 눌러 강의를 새로고침 해주세요
            </div>
          </div>
        )}
      </div>
    </PopoverContent>
  );
}
