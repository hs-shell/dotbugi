import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Vod } from '../types';
import { calculateDueDate, calculateRemainingTime, extractEndDate, formatDateString, isCurrentDateInRange } from '@/lib/utils';
import { makeVodGroupKey } from '@/utils/generate-key';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EmptyState from './EmptyState';
import CardFooterContent from './CardFooterContent';

interface VideoProps {
  courseData: Vod[];
}

function isAttended(value: string) {
  return value.toLowerCase().trim() === 'o';
}

function isAbsent(value: string) {
  return value.toUpperCase().startsWith('X');
}

export default function VodList({ courseData }: VideoProps) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!courseData || courseData.length === 0) {
    return <EmptyState label="강의" />;
  }

  const groupedData = courseData.reduce<Record<string, Vod[]>>((acc, item) => {
    const key = makeVodGroupKey(item.courseId, item.subject, item.range);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedVodGroups = Object.values(groupedData).sort((groupA, groupB) => {
    const firstA = groupA[0];
    const firstB = groupB[0];

    const isAX = isAbsent(firstA.weeklyAttendance);
    const isBX = isAbsent(firstB.weeklyAttendance);

    if (isAX && !isBX) return -1;
    if (!isAX && isBX) return 1;

    const inRangeA = isCurrentDateInRange(firstA.range);
    const inRangeB = isCurrentDateInRange(firstB.range);

    if (inRangeA && !inRangeB) return -1;
    if (!inRangeA && inRangeB) return 1;

    const isRangeANull = firstA.range === null;
    const isRangeBNull = firstB.range === null;

    if (isRangeANull && !isRangeBNull) return 1;
    if (!isRangeANull && isRangeBNull) return -1;

    if (!isAX && !isRangeANull && !isRangeBNull) {
      const dateA = new Date(firstA.range!.split(' ~ ')[0]);
      const dateB = new Date(firstB.range!.split(' ~ ')[0]);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
    }

    return firstA.courseTitle.localeCompare(firstB.courseTitle);
  });

  return (
    <div className="space-y-4">
      {sortedVodGroups.map((vods, index) => {
        if (!vods || vods.length === 0) return null;

        const sortedVods = vods.slice().sort((a, b) => {
          const aAbsent = isAbsent(a.isAttendance);
          const bAbsent = isAbsent(b.isAttendance);
          if (aAbsent && !bAbsent) return -1;
          if (!aAbsent && bAbsent) return 1;

          if (a.range && b.range) {
            const dateA = new Date(a.range.split(' ~ ')[0]);
            const dateB = new Date(b.range.split(' ~ ')[0]);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
          }

          return a.courseTitle.localeCompare(b.courseTitle);
        });

        const item = vods[0];
        const cardKey = `${item.title}-${index}`;
        const timeDifference = calculateDueDate(extractEndDate(item.range));
        const isExpanded = expandedCards[cardKey] || false;
        const attended = isAttended(item.weeklyAttendance);

        return (
          <Card
            key={cardKey}
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
                  <div
                    key={vodIndex}
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
                ))}
              </CardContent>
            )}
            <CardFooter className="flex justify-between items-center px-4 py-2 bg-[rgb(246,246,247)] font-medium">
              <CardFooterContent
                timeDifference={timeDifference}
                tooltipText={calculateRemainingTime(extractEndDate(vods[0].range))}
                statusColor={attended ? 'text-green-500' : timeDifference.textColor}
                statusIcon={attended ? 'check' : timeDifference.message.includes('시간') ? 'siren' : 'warning'}
                statusLabel={attended ? '출석' : '결석'}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
