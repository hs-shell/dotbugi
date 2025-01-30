import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Vod } from '../types';
import { calculateRemainingTimeByRange, calculateTimeDifference, cn, formatDateString } from '@/lib/utils';
import { AlarmClock, BadgeCheck, ChevronDown, ChevronUp, Clock, Siren, TriangleAlert } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import thung from '@/assets/thung.jpg';

interface Props {
  courseData: Vod[];
}

export default function Video({ courseData }: Props) {
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  if (!courseData || courseData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <img src={thung} width={100} height={100} />
        <div>강의가 없습니다</div>
      </div>
    );
  }
  const toggleCard = (courseId: string) => {
    setExpandedCards((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        if (!course) return null;

        let isDueDateSame = true;
        const timeDifference = calculateTimeDifference(course.range);
        const isExpanded = expandedCards[`${course.title}-${index}`] || false;

        return (
          <Card
            key={`${course.title}-${index}`}
            className={`w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${course.isAttendance ? 'border-green-500' : timeDifference.borderColor}`}
          >
            <CardHeader
              className={`cursor-pointer flex flex-row items-center justify-between px-5 pt-5 pb-3  hover:bg-zinc-100  transition-all duration-100 ${isExpanded && 'shadow-2xl shadow-zinc-950'}`}
              onClick={() => toggleCard(`${course.title}-${index}`)}
            >
              {/* subject 같은 애들끼리 묶기 */}
              <div className="grid grid-cols-1">
                <div className="font-semibold text-2xl mb-1">{course.courseTitle}</div>
                <div className="font-light text-lg">{course.subject}</div>
              </div>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardHeader>
            {/* {isExpanded && (
              <CardContent className="p-0">
                {vods.items.map((vod, vodIndex) => {
                  if (vod.range !== vods.items[0].range) isDueDateSame = false;
                  return (
                    <div
                      key={vodIndex}
                      className="w-full px-4 py-3 bg-[rgb(246,250,255)] hover:bg-[rgb(238,246,255)] cursor-pointer transition-colors duration-300"
                      onClick={() => window.open(`${vod.url.replace('view', 'viewer')}`, '_blank', 'VodContentWindow')}
                    >
                      <div className="font-medium" style={{ fontWeight: 550 }}>
                        {vod.title}
                      </div>
                      <div className="font-light text-zinc-500" style={{ fontSize: 10 }}>
                        {formatDateString(vod.range)}, {vod.length}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )} */}
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
                  }}
                >
                  {calculateRemainingTimeByRange(course.range)}
                </TooltipContent>
              </Tooltip>
              <div
                className={`flex items-center space-x-2 ${course.isAttendance ? 'text-green-500' : timeDifference.textColor} font-semibold`}
              >
                <div>
                  {course.isAttendance ? (
                    <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
                  ) : timeDifference.message.includes('시간') ? (
                    <Siren className="w-5 h-5 mb-1" strokeWidth={2.5} />
                  ) : (
                    <TriangleAlert className="w-5 h-5" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-base">{course.isAttendance ? '출석' : '결석'}</div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
