import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Vod } from '@/content/types';

import { calculateRemainingTimeByRange, formatDateString, removeSquareBrackets } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CourseDetailModal from './CourseDetailModal';

interface TaskStatusCardProps {
  vodList: Vod[];
}

const VodCard: React.FC<TaskStatusCardProps> = ({ vodList }) => {
  if (vodList.length === 0) return <></>;

  let value = 0;
  vodList.forEach((vod) => {
    if (vod.isAttendance.toLowerCase() === 'o') value += 1;
  });
  const total = (value * 100) / vodList.length;

  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {isVisible && (
        <CourseDetailModal
          vodList={vodList}
          onClose={() => {
            setIsVisible(false);
          }}
        />
      )}
      <Card
        className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg`}
        role="article"
        aria-label={`${vodList[0].courseTitle}`}
        onClick={() => {
          setIsVisible(true);
        }}
      >
        <CardContent className="p-4 flex flex-col">
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold truncate flex-1 mr-2">
                {removeSquareBrackets(vodList[0].courseTitle)}
              </h2>
            </div>
            <div className="font-medium text-slate-400 text-sm line-clamp-1 text-ellipsis">{vodList[0].subject}</div>
          </div>

          <div className="mt-2 flex space-x-1">
            <Badge variant="secondary" className="font-semibold hover:bg-zinc-200">
              {total === 0 ? '학습전' : vodList[0].weeklyAttendance.toLowerCase() === 'o' ? '학습완료' : '학습중'}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="bg-transparent">
                  <Badge variant="secondary" className="font-semibold hover:bg-zinc-200">
                    {formatDateString(vodList[0].range)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent
                  style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.6)',
                    opacity: 60,
                    borderRadius: '4px',
                    fontSize: '11px',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                  }}
                >
                  {calculateRemainingTimeByRange(vodList[0].range)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500 font-semibold">진도율</span>
              <span className="text-sm text-gray-500">{Math.round(total)}%</span>
            </div>
            <Progress
              value={Math.round(total)}
              className="h-2"
              indicatorColor={`${Math.round(total) === 100 ? 'bg-green-500' : Math.round(total) === 0 ? '' : 'bg-amber-500'}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(total)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default VodCard;
