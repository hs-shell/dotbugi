import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Vod } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import VodCard from './VodCard';

export function VodContent() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const [vodArray, setVodArray] = useState<Vod[][]>([]);
  const [notificationMap, setNotificationMap] = useState<Record<string, boolean>>({});
  useEffect(() => {
    loadDataFromStorage('vod', (data: string | null) => {
      if (!data) return;

      let parsedData: Vod[];
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

      const groupedData = parsedData.reduce(
        (acc, item) => {
          const key = `${item.courseId}-${item.subject}-${item.range}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, Vod[]>
      );

      const sortedVodGroups = Object.values(groupedData).sort((groupA, groupB) => {
        const firstA = groupA[0];
        const firstB = groupB[0];

        const isAX = firstA.weeklyAttendance.toUpperCase().startsWith('X');
        const isBX = firstB.weeklyAttendance.toUpperCase().startsWith('X');

        if (isAX && !isBX) return -1;
        if (!isAX && isBX) return 1;

        const rangeStartA = firstA.range.split(' ~ ')[0];
        const rangeStartB = firstB.range.split(' ~ ')[0];
        const dateA = new Date(rangeStartA);
        const dateB = new Date(rangeStartB);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        if (firstA.courseTitle < firstB.courseTitle) return -1;
        if (firstA.courseTitle > firstB.courseTitle) return 1;

        return 0;
      });
      setVodArray(sortedVodGroups);
    });
  }, []);

  useEffect(() => {
    loadDataFromStorage('vod-notification', (data: string | null) => {
      if (!data) return;
      const parsedData = JSON.parse(data);
      setNotificationMap(parsedData);
    });
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mt-12 mb-8 ">
        <div className="text-2xl font-semibold">동영상 강의 목록</div>
        <div className="text-lg font-medium">2010203</div>
      </div>
      <div className="flex flex-col h-auto md:flex-row md:overflow-hidden gap-6">
        <Card className="w-full rounded-xl min-h-[80lvh] max-h-[80lvh] bg-white zinc-900 p-6 pr-3 shadow-none overflow-hidden">
          <CardContent className="p-0 overflow-y-scroll h-screen pr-3 py-2 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 px-0 gap-4">
              {vodArray.map((vodGroup, index) => {
                const item = vodGroup[0];
                const key = `${item.courseId}-${item.subject}-${item.range}`;
                const notification = notificationMap[key] === null || notificationMap[key] === undefined ? false : true;
                return <VodCard key={index} vodList={vodGroup} notification={notification} />;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
