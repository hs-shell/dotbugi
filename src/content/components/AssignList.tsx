import { calculateDueDate, calculateRemainingTime } from '@/lib/utils';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Assign } from '../types';
import EmptyState from './EmptyState';
import CardFooterContent from './CardFooterContent';

interface AssignmentProps {
  courseData: Assign[];
}

function getStatusIcon(isSubmit: boolean, textColor: string) {
  if (isSubmit) return 'check' as const;
  if (textColor.includes('red')) return 'siren' as const;
  return 'warning' as const;
}

export default function AssignList({ courseData }: AssignmentProps) {
  if (!courseData || courseData.length === 0) {
    return <EmptyState label="과제" />;
  }

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const timeDifference = calculateDueDate(course.dueDate!);

        return (
          <Card
            onClick={() => window.open(course.url, '_blank')}
            key={`${course.title}-${index}`}
            className={`cursor-pointer w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${course.isSubmit ? 'border-green-500' : timeDifference.borderColor} hover:bg-zinc-100 transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
              <div className="grid grid-cols-1">
                <div className="font-semibold text-2xl mb-1 text-ellipsis line-clamp-1">{course.courseTitle}</div>
                <div className="font-light text-lg text-ellipsis line-clamp-1">{course.title}</div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center px-4 py-2 bg-zinc-50 font-medium">
              <CardFooterContent
                timeDifference={timeDifference}
                tooltipText={calculateRemainingTime(course.dueDate)}
                statusColor={course.isSubmit ? 'text-green-500' : timeDifference.textColor}
                statusIcon={getStatusIcon(course.isSubmit, timeDifference.textColor)}
                statusLabel={course.isSubmit ? '제출 완료' : '제출 필요'}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
