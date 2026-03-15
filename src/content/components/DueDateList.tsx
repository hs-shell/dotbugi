import { calculateDueDate, calculateRemainingTime } from '@/lib/utils';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { TimeDifferenceResult } from '../types';
import EmptyState from './EmptyState';
import CardFooterContent from './CardFooterContent';

interface DueDateItem {
  courseTitle: string;
  title: string;
  url: string;
  dueDate: string | null;
}

interface DueDateListProps<T extends DueDateItem> {
  courseData: T[];
  emptyLabel: string;
  getBorderClass: (item: T, timeDiff: TimeDifferenceResult) => string;
  getStatusIcon: (item: T, timeDiff: TimeDifferenceResult) => 'check' | 'siren' | 'warning';
  getStatusColor: (item: T, timeDiff: TimeDifferenceResult) => string;
  getStatusLabel: (item: T) => string;
}

export default function DueDateList<T extends DueDateItem>({
  courseData,
  emptyLabel,
  getBorderClass,
  getStatusIcon,
  getStatusColor,
  getStatusLabel,
}: DueDateListProps<T>) {
  if (!courseData || courseData.length === 0) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const timeDifference = calculateDueDate(course.dueDate!);

        return (
          <Card
            onClick={() => window.open(course.url, '_blank')}
            key={`${course.title}-${index}`}
            className={`cursor-pointer w-full rounded-2xl shadow-md bg-white overflow-hidden border-0 border-l-4 ${getBorderClass(course, timeDifference)} hover:bg-zinc-100 transition-all duration-200`}
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
                statusColor={getStatusColor(course, timeDifference)}
                statusIcon={getStatusIcon(course, timeDifference)}
                statusLabel={getStatusLabel(course)}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
