import { Assign } from '@/content/types';
import { useEffect, useState } from 'react';
import VodCard from './VodCard';
import { loadDataFromStorage } from '@/lib/storage';
import AssignCard from './AssignCard';

export default function AssignContent() {
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
    loadDataFromStorage('notification', (data: string | null) => {
      if (!data) return;
      const parsedData = JSON.parse(data);
      setNotificationMap(parsedData);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 px-0 gap-4">
      {assignArray.map((assign, index) => {
        const key = `${assign.courseId}-${assign.subject}-${assign.dueDate}`;
        const notification = notificationMap[key] === null || notificationMap[key] === undefined ? false : true;
        return <AssignCard key={key} notification={notification} assign={assign} />;
      })}
    </div>
  );
}
