import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Vod } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import VodCard from './VodCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import thung from '@/assets/thung.png';
import { isCurrentDateInRange } from '@/lib/utils';

export function VodContent() {
  const date = new Date();
  const [vodArray, setVodArray] = useState<Vod[][]>([]);
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

        // X가 있는 항목을 먼저 정렬
        if (isAX && !isBX) return -1;
        if (!isAX && isBX) return 1;

        const rangeA = firstA.range;
        const rangeB = firstB.range;
        const isRangeANull = rangeA === null;
        const isRangeBNull = rangeB === null;

        // isCurrentDateInRange가 true인 항목을 먼저 정렬 (X와 O 모두)
        const isCurrentDateInRangeA = isCurrentDateInRange(firstA.range);
        const isCurrentDateInRangeB = isCurrentDateInRange(firstB.range);

        if (isAX) {
          // X일 때는 isCurrentDateInRange가 true인 항목을 먼저 배치, 그 다음 null
          if (isCurrentDateInRangeA && !isCurrentDateInRangeB) return -1;
          if (!isCurrentDateInRangeA && isCurrentDateInRangeB) return 1;
          if (isRangeANull && !isRangeBNull) return 1;
          if (!isRangeANull && isRangeBNull) return -1;
        } else {
          // O일 때는 isCurrentDateInRange가 true인 항목을 먼저 배치, 그 다음 null, 그 다음 시간순 정렬
          if (isCurrentDateInRangeA && !isCurrentDateInRangeB) return -1;
          if (!isCurrentDateInRangeA && isCurrentDateInRangeB) return 1;
          if (isRangeANull && !isRangeBNull) return 1;
          if (!isRangeANull && isRangeBNull) return -1;

          // rangeStart 날짜 기준으로 시간순으로 정렬
          if (!isRangeANull && !isRangeBNull) {
            const rangeStartA = rangeA.split(' ~ ')[0];
            const rangeStartB = rangeB.split(' ~ ')[0];
            const dateA = new Date(rangeStartA);
            const dateB = new Date(rangeStartB);

            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
          }
        }

        // courseTitle로 기본 정렬
        if (firstA.courseTitle < firstB.courseTitle) return -1;
        if (firstA.courseTitle > firstB.courseTitle) return 1;

        return 0;
      });

      setVodArray(sortedVodGroups);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 pb-8 pt-4">
      <Card className="w-full rounded-xl shadow-none overflow-hidden">
        {vodArray.length === 0 ? (
          <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
            <img src={thung} width={200} height={200} className="py-32" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vodArray.map((vodGroup, index) => {
                  const item = vodGroup[0];
                  const key = `${item.courseId}-${item.subject}-${item.range}`;
                  return <VodCard key={index} vodList={vodGroup} />;
                })}
              </div>
            </CardContent>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
