import { calculateDueDate, calculateRemainingTime, isWithinSevenDays } from '@/lib/utils';
import { QuizItem } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlarmClock, Clock, Siren, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import thung from '@/assets/thung.jpg';
interface Props {
  courseData: QuizItem[];
}

export default function Quiz({ courseData }: Props) {
  if (!courseData || courseData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <img src={thung} width={100} height={100} />
        <div>과제가 없습니다</div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const quiz = course.data;
        if (!course.data || !quiz) return null;

        let isDueDateSame = true;
        const timeDifference = calculateDueDate(quiz.dueDate!);

        return (
          <Card
            onClick={() => window.open(`${quiz.url}`, '_blank')}
            key={`${course.title}-${index}`}
            className={`cursor-pointer w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${timeDifference.borderColor} hover:bg-zinc-100 transition-all duration-200`}
          >
            <CardHeader className={`flex flex-row items-center justify-between p-5 pb-3`}>
              <div className="grid grid-cols-1">
                <div className="font-semibold text-2xl mb-1">{course.title}</div>
                <div className="font-light text-lg">
                  {course.subject} - {quiz.title}
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center px-4 py-2 bg-zinc-50 font-medium">
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
              <div className={`flex items-center space-x-2 ${timeDifference.textColor} font-semibold`}>
                <div>
                  {timeDifference.textColor.includes('red') ? (
                    <Siren className="w-5 h-5 mb-1" strokeWidth={2.5} />
                  ) : (
                    <TriangleAlert className="w-5 h-5" strokeWidth={2.5} />
                  )}
                </div>
                <div className="text-base">{'직접 확인'}</div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
