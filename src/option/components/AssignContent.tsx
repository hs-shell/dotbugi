import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Assign } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import AssignCard from './AssignCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import thung from '@/assets/thung.png';

export function AssignContent() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const [assignArray, setAssignArray] = useState<Assign[]>([]);
  const [notificationMap, setNotificationMap] = useState<Record<string, boolean>>({});

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
        parsedData = data as any;
      }

      const sortedAssignArray = parsedData.sort((a, b) => {
        const isAX = a.isSubmit;
        const isBX = b.isSubmit;

        if (isAX && !isBX) return -1;
        if (!isAX && isBX) return 1;

        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        if (a.courseTitle < b.courseTitle) return -1;
        if (a.courseTitle > b.courseTitle) return 1;

        return 0;
      });

      setAssignArray(sortedAssignArray);
    });
  }, []);

  useEffect(() => {
    loadDataFromStorage('assign-notification', (data: string | null) => {
      if (!data) return;
      const parsedData = JSON.parse(data);
      setNotificationMap(parsedData);
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
                {assignArray.map((assign, index) => {
                  const key = `${assign.courseId}-${assign.title}-${assign.dueDate}`;
                  const notification =
                    notificationMap[key] === null || notificationMap[key] === undefined ? false : true;
                  return <AssignCard key={key} notification={notification} assign={assign} />;
                })}
              </div>
            </CardContent>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
