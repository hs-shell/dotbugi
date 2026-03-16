import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Assign } from '@/types';
import { loadDataFromStorage } from '@/lib/storage';
import AssignCard from './AssignCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import thung from '@/assets/thung.png';

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
        // 미제출 우선 배치
        if (!a.isSubmit && b.isSubmit) return -1;
        if (a.isSubmit && !b.isSubmit) return 1;

        // 마감 빠른 순 (null은 맨 뒤)
        const dateA = a.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(a.dueDate).getTime();
        const dateB = b.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;

        return a.courseTitle.localeCompare(b.courseTitle);
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
