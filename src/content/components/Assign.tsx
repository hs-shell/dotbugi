import { calculateDueDate, calculateRemainingTime, cn, isWithinSevenDays } from '@/lib/utils';
import { AssignData, AssignItem } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlarmClock, BadgeCheck, Clock, Siren, TriangleAlert } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  courseData: AssignItem[];
}
export default function Assign({ courseData }: Props) {
  if (courseData.length === 0)
    <div className="flex justify-center items-center h-64">
      <Spinner className="h-8 w-8" />
    </div>;

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const assign = course.data;
        if (!course.data || !assign) return null;

        let isDueDateSame = true;
        const timeDifference = calculateDueDate(assign.dueDate!);

        return (
          <Card
            onClick={() => window.open(`${assign.url}`, '_blank')}
            key={`${course.title}-${index}`}
            className={`cursor-pointer w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${assign.isSubmit ? 'border-green-500' : timeDifference.borderColor} hover:bg-zinc-100 transition-all duration-200`}
          >
            <CardHeader className={`flex flex-row items-center justify-between p-4 pb-2`}>
              <div className="grid grid-cols-1">
                <div className="font-semibold text-2xl mb-1">{course.title}</div>
                <div className="font-light text-base">
                  {course.subject} - {assign.title}
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center px-4 py-2 bg-zinc-50 font-medium ">
              <Tooltip>
                <TooltipTrigger>
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
                    clipPath: 'inset(0 0 0 0);',
                  }}
                >
                  {calculateRemainingTime(assign.dueDate)}
                </TooltipContent>
              </Tooltip>
              <div
                className={`flex items-center space-x-2 ${assign.isSubmit ? 'text-green-500' : timeDifference.textColor} font-semibold`}
              >
                {assign.isSubmit ? (
                  <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
                ) : timeDifference.message.includes('시간') ? (
                  <Siren className="w-5 h-5 mb-1" strokeWidth={2.5} />
                ) : (
                  <TriangleAlert className="w-5 h-5" strokeWidth={2.5} />
                )}
                <div className="text-base ">{assign.isSubmit ? '제출 완료' : '제출 필요'}</div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
