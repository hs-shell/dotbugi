import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Assign } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import AssignCard from './AssignCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import thung from '@/assets/thung.png';
import { isCurrentDateByDate } from '@/lib/utils';

export function AssignContent() {
  const [assignArray, setAssignArray] = useState<Assign[]>([]);

  useEffect(() => {
    loadDataFromStorage('assign', (data: string | null) => {
      if (!data) return;

      let parsedData: Assign[];
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('JSON 파싱 에러:', error);
          return;
        }
      } else {
        parsedData = data as Assign[];
      }

      const sortedAssignArray = parsedData.sort((a, b) => {
        const isAX = a.isSubmit;
        const isBX = b.isSubmit;

        // isSubmit이 false인 항목을 우선 배치
        if (!isAX && isBX) return -1;
        if (isAX && !isBX) return 1;

        const isCurrentDateByDateA = isCurrentDateByDate(a.dueDate); // isCurrentDateByDate 적용
        const isCurrentDateByDateB = isCurrentDateByDate(b.dueDate);

        // isSubmit이 false일 때는 isCurrentDateByDate가 true인 항목을 먼저 배치, 그 다음 dueDate가 null인 항목
        if (!isAX) {
          if (isCurrentDateByDateA && !isCurrentDateByDateB) return -1;
          if (!isCurrentDateByDateA && isCurrentDateByDateB) return 1;
          const isANull = a.dueDate === null;
          const isBNull = b.dueDate === null;
          if (isANull && !isBNull) return 1;
          if (!isANull && isBNull) return -1;
        }

        // isSubmit이 true일 때는 isCurrentDateByDate가 true인 항목을 먼저 배치, 그 다음 dueDate가 null인 항목
        if (isAX) {
          if (isCurrentDateByDateA && !isCurrentDateByDateB) return -1;
          if (!isCurrentDateByDateA && isCurrentDateByDateB) return 1;
          const isANull = a.dueDate === null;
          const isBNull = b.dueDate === null;
          if (isANull && !isBNull) return -1;
          if (!isANull && isBNull) return 1;
        }

        // dueDate 기준으로 날짜 순으로 정렬
        const dateA = a.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(a.dueDate!).getTime();
        const dateB = b.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(b.dueDate!).getTime();

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        // courseTitle로 기본 정렬
        if (a.courseTitle < b.courseTitle) return -1;
        if (a.courseTitle > b.courseTitle) return 1;

        return 0;
      });

      setAssignArray(sortedAssignArray);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 pb-8 pt-4">
      <Card className="w-full rounded-xl shadow-none overflow-hidden">
        {assignArray.length === 0 ? (
          <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
            <img src={thung} width={200} height={200} className="py-32" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignArray.map((assign) => {
                  const key = `${assign.courseId}-${assign.title}-${assign.dueDate}`;
                  return <AssignCard key={key} assign={assign} />;
                })}
              </div>
            </CardContent>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
