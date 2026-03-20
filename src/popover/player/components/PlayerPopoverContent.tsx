import { PopoverContent } from '@radix-ui/react-popover';
import PlayerIframe from './PlayerIframe';
import type { Vod } from '@/types';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { loadDataFromStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import { isAttended, isCurrentDateInRange } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PlayerPopoverContentProps {
  isPopoverOpen: boolean;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

export default function PlayerPopoverContent({ isPopoverOpen, isPlaying, setIsPlaying }: PlayerPopoverContentProps) {
  const { t } = useTranslation('player');
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

  const skipPlayerFilter = !!import.meta.env.VITE_MOCK_COURSES;
  const usePureMock = !!import.meta.env.VITE_MOCK && !import.meta.env.VITE_MOCK_COURSES;

  const loadUnattendedVods = useCallback(async () => {
    if (usePureMock) {
      const { mockPlayerVodIds } = await import('@/mocks/mockData');
      const BASE = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=';
      setVods(
        mockPlayerVodIds.map((id, i) => ({
          courseId: 'mock',
          courseTitle: 'Player Test',
          prof: '',
          week: i + 1,
          subject: `${i + 1}주차`,
          title: `VOD-${id}`,
          url: `${BASE}${id}`,
          range: null,
          length: '00:00',
          isAttendance: 'X',
          weeklyAttendance: 'X',
        })),
      );
      return;
    }
    loadDataFromStorage<Vod[]>('vod', (data) => {
      if (!data) return;
      loadDataFromStorage<string[]>('hiddenTaskUrls', (hiddenUrls) => {
        const hidden = new Set(hiddenUrls ?? []);
        if (skipPlayerFilter) {
          setVods(data.filter((vod) => !hidden.has(vod.url)));
        } else {
          setVods(data.filter((vod) => !hidden.has(vod.url) && isCurrentDateInRange(vod.range) && !isAttended(vod.isAttendance)));
        }
      });
    });
  }, [skipPlayerFilter, usePureMock]);

  useEffect(() => {
    loadUnattendedVods();
  }, [loadUnattendedVods]);

  // Dashboard에서 새로고침 시 storage 변경을 감지해서 player 목록 갱신
  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if ((changes.vod || changes.hiddenTaskUrls) && !isPlaying) {
        loadUnattendedVods();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [loadUnattendedVods, isPlaying]);

  useEffect(() => {
    if (isPopoverOpen && !isPlaying && vods.length === 0) {
      loadUnattendedVods();
    }
  }, [isPlaying, vods, isPopoverOpen, loadUnattendedVods]);

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
      ? t('stopWatching')
      : isPlaying
        ? t('expectedEnd', { time: formatExpectedEndTime(totalDurationSeconds) })
        : isDone
          ? t('doneWatching')
          : t('startWatching');

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
                <div className="flex items-baseline justify-between mb-4 flex-shrink-0">
                  <h3 className="text-4xl font-bold text-black">{t('lectureList')}</h3>
                  <span className="text-lg text-zinc-400 font-medium">
                    {currentVideoIndex + 1} / {vods.length}
                  </span>
                </div>
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
              {t('noVideos')}
            </div>
            <div className="w-full flex items-center justify-center text-zinc-500">
              {t('refreshPrompt')}
            </div>
          </div>
        )}
      </div>
    </PopoverContent>
  );
}
