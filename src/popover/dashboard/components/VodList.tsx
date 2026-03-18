import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Vod } from '@/types';
import { calculateDueDate, calculateRemainingTime, extractEndDate, formatDateString, isAbsent, isAttended } from '@/lib/utils';
import { makeVodGroupKey } from '@/lib/generateKey';
import { ChevronDown, ChevronUp, EyeOff } from 'lucide-react';
import EmptyState from './EmptyState';
import CardFooterContent from './CardFooterContent';
import { useTranslation } from 'react-i18next';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface VideoProps {
  courseData: Vod[];
  onHideTask?: (url: string) => void;
  onHideTasks?: (urls: string[]) => void;
}

export default function VodList({ courseData, onHideTask, onHideTasks }: VideoProps) {
  const { t } = useTranslation('common');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!courseData || courseData.length === 0) {
    return <EmptyState label="vod" />;
  }

  const groupedData = courseData.reduce<Record<string, Vod[]>>((acc, item) => {
    const key = makeVodGroupKey(item.courseId, item.subject, item.range);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const getEndTime = (range: string | null) => {
    const end = extractEndDate(range);
    return end ? new Date(end).getTime() : Number.MAX_SAFE_INTEGER;
  };

  const compareByAbsentThenEndTime = (a: Vod, b: Vod, absentKey: keyof Vod) => {
    const aAbsent = isAbsent(a[absentKey] as string);
    const bAbsent = isAbsent(b[absentKey] as string);
    if (aAbsent !== bAbsent) return aAbsent ? -1 : 1;
    return getEndTime(a.range) - getEndTime(b.range);
  };

  const sortedVodGroups = Object.values(groupedData).sort((groupA, groupB) =>
    compareByAbsentThenEndTime(groupA[0], groupB[0], 'weeklyAttendance'),
  );

  return (
    <div className="space-y-4">
      {sortedVodGroups.map((vods) => {
        if (!vods || vods.length === 0) return null;

        const sortedVods = vods.slice().sort((a, b) => compareByAbsentThenEndTime(a, b, 'isAttendance'));

        const item = vods[0];
        const cardKey = makeVodGroupKey(item.courseId, item.subject, item.range);
        const timeDifference = calculateDueDate(extractEndDate(item.range));
        const isExpanded = expandedCards[cardKey] || false;
        const attended = isAttended(item.weeklyAttendance);

        return (
          <ContextMenu key={cardKey}>
            <ContextMenuTrigger asChild>
              <Card
                className={`w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${attended ? 'border-green-500' : timeDifference.borderColor}`}
              >
                <CardHeader
                  className={`cursor-pointer flex flex-row items-center justify-between px-5 pt-5 pb-3 hover:bg-zinc-100 transition-all duration-100 ${isExpanded && 'shadow-2xl shadow-zinc-950'}`}
                  onClick={() => toggleCard(cardKey)}
                >
                  <div className="grid grid-cols-1">
                    <div className="font-semibold text-2xl mb-1">{item.courseTitle}</div>
                    <div className="font-light text-lg">{item.subject}</div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardHeader>
                {isExpanded && (
                  <CardContent className="p-0">
                    {sortedVods.map((vod, vodIndex) => (
                      <ContextMenu key={vodIndex}>
                        <ContextMenuTrigger asChild>
                          <div
                            className="w-full px-4 py-3 bg-[rgb(246,250,255)] hover:bg-[rgb(238,246,255)] cursor-pointer transition-colors duration-300"
                            onClick={() => window.open(vod.url.replace('view', 'viewer'), '_blank', 'VodContentWindow')}
                          >
                            <div className="font-medium text-ellipsis line-clamp-1" style={{ fontWeight: 550 }}>
                              {vod.title}
                            </div>
                            <div className="font-light text-zinc-500 text-ellipsis line-clamp-1" style={{ fontSize: 10 }}>
                              {formatDateString(vod.range)},{' '}
                              <span className={`font-medium ${isAttended(vod.isAttendance) ? 'text-green-500' : 'text-amber-500'}`}>
                                {vod.length}
                              </span>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => onHideTask?.(vod.url)}
                            className="text-lg gap-2 cursor-pointer"
                          >
                            <EyeOff className="w-4 h-4" />
                            {t('hide.task')}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </CardContent>
                )}
                <CardFooter className="flex justify-between items-center px-4 py-2 bg-[rgb(246,246,247)] font-medium">
                  <CardFooterContent
                    timeDifference={timeDifference}
                    tooltipText={calculateRemainingTime(extractEndDate(vods[0].range))}
                    statusColor={attended ? 'text-green-500' : timeDifference.textColor}
                    statusIcon={attended ? 'check' : timeDifference.status === 'urgent' ? 'siren' : 'warning'}
                    statusLabel={attended ? t('attendance.attended') : t('attendance.absent')}
                  />
                </CardFooter>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => onHideTasks?.(vods.map((v) => v.url))}
                className="text-lg gap-2 cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
                {t('hide.task')}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
