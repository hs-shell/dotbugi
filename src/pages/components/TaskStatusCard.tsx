import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Play, Clock } from 'lucide-react';
import { Vod } from '@/content/types';
import Modal from './Modal';
import NotificationSwitch from '@/components/ui/notification-switch';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { toast, useToast } from '@/hooks/use-toast';
import { removeSquareBrackets } from '@/lib/utils';

interface TaskStatusCardProps {
  notification: boolean;
  vodList: Vod[];
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ notification, vodList }) => {
  if (vodList.length === 0) return <></>;

  // 진행률 계산
  let value = 0;
  vodList.forEach((vod) => {
    if (vod.isAttendance.toLowerCase() === 'o') value += 1;
  });
  const total = (value * 100) / vodList.length;

  const [isVisible, setIsVisible] = useState(false);
  const [toggle, setToggle] = useState(notification);
  // 사용자가 직접 토글을 변경했는지 여부를 추적하는 상태
  const [userInitiatedToggle, setUserInitiatedToggle] = useState(false);
  const { toast } = useToast();

  // 부모에서 전달된 notification 값이 변경되면 toggle을 동기화
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

        // 사용자가 직접 토글 변경한 경우에만 toast 표시
        if (userInitiatedToggle) {
          toast({
            title: toggle ? '알림 설정 🔔' : '알림 취소 🔕',
            description: removeSquareBrackets(`${vodList[0].courseTitle} - ${vodList[0].subject}`),
            variant: 'default',
          });
          // toast 표시 후 flag 초기화
          setUserInitiatedToggle(false);
        }
      } catch (error) {
        toast({
          title: '오류가 발생 했습니다. 🚨',
          variant: 'destructive',
        });
      }
    });
    // userInitiatedToggle도 의존성에 포함하여, 사용자가 토글한 경우 toast가 발생하도록 함
  }, [toggle, userInitiatedToggle, toast, vodList]);

  return (
    <>
      {isVisible && (
        <Modal
          vodList={vodList}
          onClose={() => {
            setIsVisible(false);
          }}
        />
      )}
      <Card
        className="w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
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

          <div className="mt-2">
            <Badge variant="secondary" className="font-semibold">
              {total === 0 ? '학습전' : vodList[0].weeklyAttendance.toLowerCase() === 'o' ? '학습완료' : '학습중'}
            </Badge>
          </div>
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Progress</span>
              <span className="text-sm text-gray-500">{Math.round(total)}%</span>
            </div>
            <Progress
              value={Math.round(total)}
              className="h-2"
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

export default TaskStatusCard;
