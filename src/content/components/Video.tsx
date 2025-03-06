import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Vod } from '../types';
import { calculateRemainingTimeByRange, calculateTimeDifference, cn, formatDateString } from '@/lib/utils';
import { AlarmClock, BadgeCheck, ChevronDown, ChevronUp, Clock, Siren, TriangleAlert } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import thung from '@/assets/thung.png';

interface Props {
  courseData: Vod[];
}

export default function Video({ courseData }: Props) {
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  if (!courseData || courseData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
        <img src={thung} width={100} height={100} />
        <div>
          <span className="py-3 text-2xl font-medium">강의가 없습니다</span>
        </div>
      </div>
    );
  }
  const toggleCard = (courseId: string) => {
    setExpandedCards((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const groupedData = courseData.reduce(
    (acc, item) => {
      const key = `${item.courseId}-${item.subject}-${item.range}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, Vod[]>
  );

  const sortedVodGroups = Object.values(groupedData).sort((groupA, groupB) => {
    const firstA = groupA[0];
    const firstB = groupB[0];

    const isAX = firstA.weeklyAttendance.toUpperCase().startsWith('X');
    const isBX = firstB.weeklyAttendance.toUpperCase().startsWith('X');

    if (isAX && !isBX) return -1;
    if (!isAX && isBX) return 1;

    const rangeStartA = firstA.range.split(' ~ ')[0];
    const rangeStartB = firstB.range.split(' ~ ')[0];
    const dateA = new Date(rangeStartA);
    const dateB = new Date(rangeStartB);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    if (firstA.courseTitle < firstB.courseTitle) return -1;
    if (firstA.courseTitle > firstB.courseTitle) return 1;

    return 0;
  });

  return (
    <div className="space-y-4">
      {sortedVodGroups.map((vods, index) => {
        if (!vods || vods.length === 0) return null;

        const sortedVods = vods.slice().sort((a, b) => {
          const isAX = a.isAttendance.toUpperCase().startsWith('X');
          const isBX = b.isAttendance.toUpperCase().startsWith('X');
          if (isAX && !isBX) return -1;
          if (!isAX && isBX) return 1;

          const rangeStartA = a.range.split(' ~ ')[0];
          const rangeStartB = b.range.split(' ~ ')[0];
          const dateA = new Date(rangeStartA);
          const dateB = new Date(rangeStartB);
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;

          if (a.courseTitle < b.courseTitle) return -1;
          if (a.courseTitle > b.courseTitle) return 1;

          return 0;
        });

        const item = vods[0];
        let isDueDateSame = true;
        const timeDifference = calculateTimeDifference(item.range);
        const isExpanded = expandedCards[`${item.title}-${index}`] || false;

        return (
          <Card
            key={`${item.title}-${index}`}
            className={`w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${item.weeklyAttendance.toLocaleLowerCase().trim() === 'o' ? 'border-green-500' : timeDifference.borderColor}`}
          >
            <CardHeader
              className={`cursor-pointer flex flex-row items-center justify-between px-5 pt-5 pb-3  hover:bg-zinc-100  transition-all duration-100 ${isExpanded && 'shadow-2xl shadow-zinc-950'}`}
              onClick={() => toggleCard(`${item.title}-${index}`)}
            >
              <div className="grid grid-cols-1">
                <div className="font-semibold text-2xl mb-1">{item.courseTitle}</div>
                <div className="font-light text-lg">{item.subject}</div>
              </div>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardHeader>
            {isExpanded && (
              <CardContent className="p-0">
                {sortedVods.map((vod, vodIndex) => {
                  return (
                    <div
                      key={vodIndex}
                      className="w-full px-4 py-3 bg-[rgb(246,250,255)] hover:bg-[rgb(238,246,255)] cursor-pointer transition-colors duration-300"
                      onClick={() => window.open(`${vod.url.replace('view', 'viewer')}`, '_blank', 'VodContentWindow')}
                    >
                      <div className="font-medium text-ellipsis line-clamp-1" style={{ fontWeight: 550 }}>
                        {vod.title}
                      </div>
                      <div className="font-light text-zinc-500 text-ellipsis line-clamp-1" style={{ fontSize: 10 }}>
                        {formatDateString(vod.range)},{' '}
                        <span
                          className={`font-medium ${vod.isAttendance.toLowerCase() === 'o' ? 'text-green-500' : 'text-amber-500'} `}
                        >
                          {vod.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
            <CardFooter className="flex justify-between items-center px-4 py-2 bg-[rgb(246,246,247)] font-medium">
              <Tooltip>
                <TooltipTrigger className="bg-transparent">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" strokeWidth={2} />
                    <span className={`text-base items-center`}>
                      {isDueDateSame ? timeDifference.message : '확인 필요'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.6)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                    zIndex: '9999',
                  }}
                >
                  {calculateRemainingTimeByRange(vods[0].range)}
                </TooltipContent>
              </Tooltip>
              <div
                className={`flex items-center space-x-2 ${item.weeklyAttendance.toLocaleLowerCase().trim() === 'o' ? 'text-green-500' : timeDifference.textColor} font-semibold`}
              >
                <div>
                  {item.weeklyAttendance.toLocaleLowerCase().trim() === 'o' ? (
                    <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
                  ) : timeDifference.message.includes('시간') ? (
                    <Siren className="w-5 h-5 mb-1" strokeWidth={2.5} />
                  ) : (
                    <TriangleAlert className="w-5 h-5" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-base">
                  {item.weeklyAttendance.toLocaleLowerCase().trim() === 'o' ? '출석' : '결석'}
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
