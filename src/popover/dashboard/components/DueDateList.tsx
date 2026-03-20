import { calculateDueDate, calculateRemainingTime } from '@/lib/utils';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { TimeDifferenceResult } from '@/types';
import EmptyState from './EmptyState';
import CardFooterContent from './CardFooterContent';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DueDateItem {
  courseTitle: string;
  title: string;
  url: string;
  dueDate: string | null;
}

interface DueDateListProps<T extends DueDateItem> {
  courseData: T[];
  emptyLabel: 'vod' | 'assign' | 'quiz';
  getBorderClass: (item: T, timeDiff: TimeDifferenceResult) => string;
  getStatusIcon: (item: T, timeDiff: TimeDifferenceResult) => 'check' | 'siren' | 'warning';
  getStatusColor: (item: T, timeDiff: TimeDifferenceResult) => string;
  getStatusLabel: (item: T) => string;
  onHideTask?: (url: string) => void;
}

export default function DueDateList<T extends DueDateItem>({
  courseData,
  emptyLabel,
  getBorderClass,
  getStatusIcon,
  getStatusColor,
  getStatusLabel,
  onHideTask,
}: DueDateListProps<T>) {
  const { t } = useTranslation('common');

  if (!courseData || courseData.length === 0) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const timeDifference = calculateDueDate(course.dueDate!);

        return (
          <ContextMenu key={`${course.title}-${index}`}>
            <ContextMenuTrigger asChild>
              <Card
                onClick={() => window.open(course.url, '_blank')}
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
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => onHideTask?.(course.url)}
                className="text-lg gap-2 cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
                {t('hide.task')}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
