import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Assign, Quiz, Vod } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import AssignCard from './AssignCard';

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
    <>
      <div className="flex justify-between items-center mt-12 mb-8 ">
        <div className="text-2xl font-semibold">과제 목록</div>
        <div className="text-lg font-medium">2010203</div>
      </div>
      <div className="flex flex-col h-auto md:flex-row md:overflow-hidden gap-6">
        <Card className="w-full rounded-xl min-h-[80lvh] max-h-[80lvh] bg-white zinc-900 p-6 pr-3 shadow-none overflow-hidden">
          <CardContent className="p-0 overflow-y-scroll h-screen pr-3 py-2 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 px-0 gap-4">
              {assignArray.map((assign, index) => {
                const key = `${assign.courseId}-${assign.title}-${assign.dueDate}`;
                const notification = notificationMap[key] === null || notificationMap[key] === undefined ? false : true;
                return <AssignCard key={key} notification={notification} assign={assign} />;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
