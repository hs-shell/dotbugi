import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Play, Clock } from 'lucide-react';
import { Vod } from '@/content/types';

import NotificationSwitch from '@/components/ui/notification-switch';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { toast, useToast } from '@/hooks/use-toast';
import {
  calculateRemainingTimeByRange,
  calculateTimeDifference,
  formatDateString,
  removeSquareBrackets,
} from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CourseDetailModal from './CourseDetailModal';

interface TaskStatusCardProps {
  notification: boolean;
  vodList: Vod[];
}

const VodCard: React.FC<TaskStatusCardProps> = ({ notification, vodList }) => {
  if (vodList.length === 0) return <></>;

  let value = 0;
  vodList.forEach((vod) => {
    if (vod.isAttendance.toLowerCase() === 'o') value += 1;
  });
  const total = (value * 100) / vodList.length;

  const [isVisible, setIsVisible] = useState(false);
  const [toggle, setToggle] = useState(notification);
  const [userInitiatedToggle, setUserInitiatedToggle] = useState(false);
  const { toast } = useToast();

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
        const item = vodList[0];
        const key = `${item.courseId}-${item.subject}-${item.range}`;

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
            description: removeSquareBrackets(`${vodList[0].courseTitle} - ${vodList[0].subject}`),
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
  }, [toggle, userInitiatedToggle, toast, vodList]);

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
              <h2 className="text-lg font-semibold truncate flex-1 mr-2">{vodList[0].courseTitle}</h2>
              <p>
                <NotificationSwitch
                  isSelected={toggle}
                  onChange={() => {
                    // 사용자가 토글을 변경할 때 flag를 true로 설정
                    setToggle((prev) => !prev);
                    setUserInitiatedToggle(true);
                  }}
                />
              </p>
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
