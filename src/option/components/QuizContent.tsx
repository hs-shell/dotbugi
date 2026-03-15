import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Quiz } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import QuizCard from './QuizCard';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import thung from '@/assets/thung.png';

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
        // 마감 빠른 순 (null은 맨 뒤)
        const dateA = a.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(a.dueDate).getTime();
        const dateB = b.dueDate === null ? Number.MAX_SAFE_INTEGER : new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;

        return a.courseTitle.localeCompare(b.courseTitle);
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
