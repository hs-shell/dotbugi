import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Assign } from '@/content/types';

import { calculateDueDate, calculateRemainingTime } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskStatusCardProps {
  assign: Assign;
}

const AssignCard: React.FC<TaskStatusCardProps> = ({ assign }) => {
  const [showRemainingTime, setShowRemainingTime] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRemainingTime) {
      timer = setTimeout(() => {
        setShowRemainingTime(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showRemainingTime]);

  if (!assign) {
    return <></>;
  }
  const timeDifference = calculateDueDate(assign.dueDate);

  return (
    <Card
      className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg border-l-4 ${assign.isSubmit ? 'border-l-green-500' : timeDifference.borderLeftColor}`}
      role="article"
      aria-label={`${assign.courseTitle}`}
      onClick={() => {
        window.open(assign.url, '_blank');
      }}
    >
      <CardContent className="p-4 flex flex-col">
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold truncate flex-1 mr-2">{assign.courseTitle}</h2>
          </div>
          <div className="font-medium text-slate-400 text-sm line-clamp-1 text-ellipsis">{assign.title}</div>
        </div>

        <div className="mt-6 flex space-x-1">
          <Badge
            variant="secondary"
            className={`font-semibold hover:bg-zinc-200`}
            // className={`font-semibold ${assign.isSubmit ? 'bg-green-900' : timeDifference.message.includes('마감') ? 'bg-red-950' : 'bg-amber-500'} bg-opacity-10`}
          >
            {assign.isSubmit ? '제출완료' : '제출필요'}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="bg-transparent">
                <Badge variant="secondary" className="font-semibold hover:bg-zinc-200">
                  {assign.dueDate}
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
                {calculateRemainingTime(assign.dueDate)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignCard;
