import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quiz } from '@/content/types';

import NotificationSwitch from '@/components/ui/notification-switch';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { calculateDueDate, calculateRemainingTime, calculateTimeDifference, removeSquareBrackets } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskStatusCardProps {
  notification: boolean;
  quiz: Quiz;
}

const QuizCard: React.FC<TaskStatusCardProps> = ({ notification, quiz }) => {
  if (!quiz) return <></>;

  const [toggle, setToggle] = useState(notification);

  const [userInitiatedToggle, setUserInitiatedToggle] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setToggle(notification);
  }, [notification]);

  useEffect(() => {
    loadDataFromStorage('quiz-notification', (data: string | null) => {
      try {
        let parsedData: Record<string, any> = {};
        if (data) {
          try {
            parsedData = JSON.parse(data);
          } catch (error) {
            console.error('저장된 데이터를 파싱하는 중 오류가 발생했습니다.', error);
          }
        }
        const key = `${quiz.courseId}-${quiz.title}-${quiz.dueDate}`;

        if (toggle) {
          parsedData[key] = true;
        } else {
          if (key in parsedData) {
            delete parsedData[key];
          }
        }
        saveDataToStorage('quiz-notification', JSON.stringify(parsedData));

        if (userInitiatedToggle) {
          toast({
            title: toggle ? '알림 설정 🔔' : '알림 취소 🔕',
            description: removeSquareBrackets(`${quiz.courseTitle} - ${quiz.title}`),
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
  }, [toggle, userInitiatedToggle, toast, quiz]);

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

  const timeDifference = calculateDueDate(quiz.dueDate);

  return (
    <Card
      className={`w-full cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg border-l-4 ${timeDifference.borderLeftColor}`}
      role="article"
      aria-label={`${quiz.courseTitle}`}
      onClick={() => {
        window.open(quiz.url, '_blank');
      }}
    >
      <CardContent className="p-4 flex flex-col">
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold truncate flex-1 mr-2">{quiz.courseTitle}</h2>
            <p>
              <NotificationSwitch
                isSelected={toggle}
                onChange={() => {
                  if (!toggle) {
                    chrome.runtime.sendMessage(
                      {
                        action: 'scheduleAlarm',
                        alarmId: `${quiz.courseId}-${quiz.title}-${quiz.dueDate}`,
                        dateTime: quiz.dueDate, // 이벤트 날짜/시간
                        title: '퀴즈 참여 하셨나요?', // 알림 제목
                        message: '하루 뒤에 마감이에요 서두르세요!', // 알림 메시지
                      },
                      (response) => {}
                    );
                  } else {
                    chrome.runtime.sendMessage(
                      {
                        action: 'cancelAlarm',
                        alarmId: `${quiz.courseId}-${quiz.title}-${quiz.dueDate}`,
                      },
                      (response) => {}
                    );
                  }
                  setToggle((prev) => !prev);
                  setUserInitiatedToggle(true);
                }}
              />
            </p>
          </div>
          <div className="font-medium text-slate-400 text-sm line-clamp-1 text-ellipsis">{quiz.title}</div>
        </div>

        <div className="mt-6 flex space-x-1">
          <Badge variant="secondary" className={`font-semibold hover:bg-zinc-200`}>
            직접확인
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="bg-transparent">
                <Badge variant="secondary" className="font-semibold hover:bg-zinc-200">
                  {quiz.dueDate}
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
                {calculateRemainingTime(quiz.dueDate)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
