import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Assign, Vod } from '@/content/types';

import NotificationSwitch from '@/components/ui/notification-switch';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { calculateDueDate, calculateRemainingTime, calculateTimeDifference, removeSquareBrackets } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskStatusCardProps {
  notification: boolean;
  assign: Assign;
}

const AssignCard: React.FC<TaskStatusCardProps> = ({ notification, assign }) => {
  if (!assign) return <></>;

  const [toggle, setToggle] = useState(notification);

  const [userInitiatedToggle, setUserInitiatedToggle] = useState(false);
  const { toast } = useToast();

  console.log(assign.dueDate);
  useEffect(() => {
    setToggle(notification);
  }, [notification]);

  useEffect(() => {
    loadDataFromStorage('notification', (data: string | null) => {
      try {
        let parsedData: Record<string, any> = {};
        if (data) {
          try {
            parsedData = JSON.parse(data);
          } catch (error) {
            console.error('저장된 데이터를 파싱하는 중 오류가 발생했습니다.', error);
          }
        }
        const key = `${assign.courseId}-${assign.subject}-${assign.dueDate}`;

        if (toggle) {
          parsedData[key] = true;
        } else {
          if (key in parsedData) {
            delete parsedData[key];
          }
        }
        saveDataToStorage('notification', JSON.stringify(parsedData));

        if (userInitiatedToggle) {
          toast({
            title: toggle ? '알림 설정 🔔' : '알림 취소 🔕',
            description: removeSquareBrackets(`${assign.courseTitle} - ${assign.title}`),
            variant: 'default',
          });
          setUserInitiatedToggle(false);
        }
      } catch (error) {
        toast({
          title: '오류가 발생 했습니다. 🚨',
          variant: 'destructive',
        });
      }
    });
  }, [toggle, userInitiatedToggle, toast, assign]);

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
            <p>
              <NotificationSwitch
                isSelected={toggle}
                onChange={() => {
                  setToggle((prev) => !prev);
                  setUserInitiatedToggle(true);
                }}
              />
            </p>
          </div>
          <div className="font-medium text-slate-400 text-sm line-clamp-1 text-ellipsis">{assign.title}</div>
        </div>

        <div className="mt-2 flex space-x-1">
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
