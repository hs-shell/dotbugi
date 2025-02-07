import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Quiz, Vod } from '@/content/types';
import { loadDataFromStorage } from '@/lib/storage';
import QuizCard from './QuizCard';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import thung from '@/assets/thung.png';

export function QuizContent() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('ko-KR', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const [quizArray, setQuizArray] = useState<Quiz[]>([]);
  const [notificationMap, setNotificationMap] = useState<Record<string, boolean>>({});

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
        parsedData = data as any;
      }

      const sortedQuizArray = parsedData.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        if (a.courseTitle < b.courseTitle) return -1;
        if (a.courseTitle > b.courseTitle) return 1;

        return 0;
      });

      setQuizArray(sortedQuizArray);
    });
  }, []);

  useEffect(() => {
    loadDataFromStorage('quiz-notification', (data: string | null) => {
      if (!data) return;
      const parsedData = JSON.parse(data);
      setNotificationMap(parsedData);
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
                {quizArray.map((quiz, index) => {
                  const key = `${quiz.courseId}-${quiz.title}-${quiz.dueDate}`;
                  const notification =
                    notificationMap[key] === null || notificationMap[key] === undefined ? false : true;
                  return <QuizCard key={key} notification={notification} quiz={quiz} />;
                })}
              </div>
            </CardContent>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
