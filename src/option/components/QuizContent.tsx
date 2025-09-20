import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Quiz } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import QuizCard from './QuizCard';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import thung from '@/assets/thung.png';
import { isCurrentDateByDate } from '@/lib/utils';

export function QuizContent() {
  const [quizArray, setQuizArray] = useState<Quiz[]>([]);

  useEffect(() => {
    loadDataFromStorage('quiz', (data: string | null) => {
      if (!data) return;

      let parsedData: Quiz[];
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('JSON 파싱 에러:', error);
          return;
        }
      } else {
        parsedData = data as Quiz[];
      }

      const sortedQuizArray = parsedData.sort((a, b) => {
        const isCurrentDateByDateA = isCurrentDateByDate(a.dueDate); // isCurrentDateByDate 적용
        const isCurrentDateByDateB = isCurrentDateByDate(b.dueDate);

        // isCurrentDateByDate가 true인 항목을 우선 배치, 그 다음 dueDate가 null인 항목
        if (isCurrentDateByDateA && !isCurrentDateByDateB) return -1;
        if (!isCurrentDateByDateA && isCurrentDateByDateB) return 1;

        const isANull = a.dueDate === null;
        const isBNull = b.dueDate === null;

        if (isANull && !isBNull) return 1; // A가 null이면 B가 우선
        if (!isANull && isBNull) return -1; // B가 null이면 A가 우선

        // dueDate 기준으로 날짜 순으로 정렬
        const dateA = isANull ? Number.MAX_SAFE_INTEGER : new Date(a.dueDate!).getTime();
        const dateB = isBNull ? Number.MAX_SAFE_INTEGER : new Date(b.dueDate!).getTime();

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        // courseTitle로 기본 정렬
        if (a.courseTitle < b.courseTitle) return -1;
        if (a.courseTitle > b.courseTitle) return 1;

        return 0;
      });

      setQuizArray(sortedQuizArray);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 pb-8 pt-4">
      <Card className="w-full rounded-xl shadow-none overflow-hidden">
        {quizArray.length === 0 ? (
          <div className="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
            <img src={thung} width={200} height={200} className="py-32" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizArray.map((quiz) => {
                  const key = `${quiz.courseId}-${quiz.title}-${quiz.dueDate}`;
                  return <QuizCard key={key} quiz={quiz} />;
                })}
              </div>
            </CardContent>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
