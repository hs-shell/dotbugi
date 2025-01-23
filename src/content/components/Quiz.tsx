import { calculateDueDate, isWithinSevenDays } from '@/lib/utils';
import { QuizData, QuizItem } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlarmClock } from 'lucide-react';

interface Props {
  courseData: QuizItem[];
}

export default function Quiz({ courseData }: Props) {
  if (courseData.length === 0)
    <div className="flex justify-center items-center h-64">
      <Spinner className="h-8 w-8" />
    </div>;

  return (
    <div className="space-y-4">
      {courseData.map((course, index) => {
        const quiz = course.data;
        if (!course.data || !quiz) return null;

        let isDueDateSame = true;
        const timeDifference = calculateDueDate(quiz.dueDate!);

        return (
          <Card key={`${course.title}-${index}`} className="w-full border-none shadow-md bg-white overflow-hidden">
            <CardHeader
              className={`cursor-pointer flex flex-row items-center justify-between p-4 border-l-4 ${timeDifference.borderColor}`}
            >
              <div className="font-semibold">
                {course.title} - {course.prof}
              </div>
            </CardHeader>
            <CardContent className="p-4">{`${quiz.title}`}</CardContent>
            <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
              <div className="flex items-center space-x-2">
                <AlarmClock className="w-5 h-5 text-gray-600" />
                <span className={`text-sm ${timeDifference.textColor}`}>
                  {isDueDateSame ? timeDifference.message : '확인 필요'}
                </span>
              </div>
              {'직접 확인'}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
