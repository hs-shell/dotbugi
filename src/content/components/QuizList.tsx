import { calculateDueDate, calculateRemainingTime } from '@/lib/utils';
import { Quiz } from '../types';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import EmptyState from './EmptyState';
import CardFooterContent from './CardFooterContent';

interface QuizTabProps {
  courseData: Quiz[];
}

export default function QuizList({ courseData }: QuizTabProps) {
  if (!courseData || courseData.length === 0) {
    return <EmptyState label="퀴즈" />;
  }

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const timeDifference = calculateDueDate(course.dueDate!);

        return (
          <Card
            onClick={() => window.open(course.url, '_blank')}
            key={`${course.title}-${index}`}
            className={`cursor-pointer w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${timeDifference.borderColor} hover:bg-zinc-100 transition-all duration-200`}
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
                statusColor={timeDifference.textColor}
                statusIcon={timeDifference.textColor.includes('red') ? 'siren' : 'warning'}
                statusLabel="직접 확인"
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
