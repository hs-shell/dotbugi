'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { type CourseData, VodData } from '../types';
import { calculateTimeDifference, cn, isCurrentDateInRange } from '@/lib/utils';
import { AlarmClock, ChevronDown, ChevronUp } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Props {
  // vodData?: VodData[];
  // setVodData: () => void;
  courseData: CourseData[];
}

export default function Video({ courseData }: Props) {
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  if (courseData.length === 0 || courseData.some((course) => !course.data || !course.data.vodData)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const toggleCard = (courseId: string) => {
    setExpandedCards((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  return (
    <div className="space-y-4">
      {courseData.map((course) => {
        const vodData = course.data?.vodData.filter((data) => {
          return data.items.some((item) => isCurrentDateInRange(item.range!));
        });
        if (!course.data || !vodData || vodData.length === 0) return null;

        return vodData.map((vods, index) => {
          let isDueDateSame = true;
          const timeDifference = calculateTimeDifference(vods.items[0].range!);
          const isExpanded = expandedCards[`${course.title}-${index}`] || false;

          return (
            <Card
              key={`${course.title}-${index}`}
              className="w-full rounded-2xl border-none shadow-md bg-white overflow-hidden"
            >
              <CardHeader
                className={`cursor-pointer flex flex-row items-center justify-between p-4 border-l-4 ${timeDifference.borderColor}`}
                onClick={() => toggleCard(`${course.title}-${index}`)}
              >
                <div className="font-semibold">
                  {course.title} - {course.prof}
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-4">
                  {vods.items.map((vod, vodIndex) => {
                    if (vod.range !== vods.items[0].range) isDueDateSame = false;
                    return (
                      <div key={vodIndex} className="mb-2 last:mb-0">
                        <div className="font-medium">{vod.title}</div>
                        <div className="text-sm text-gray-600">{vod.range}</div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
              <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <AlarmClock className="w-5 h-5 text-gray-600" />
                  <span className={`text-sm ${timeDifference.textColor}`}>
                    {isDueDateSame ? timeDifference.message : '확인 필요'}
                  </span>
                </div>
                <div>{vods.isAttendance ? '출석' : '결석'}</div>
              </CardFooter>
            </Card>
          );
        });
      })}
    </div>
  );
}
