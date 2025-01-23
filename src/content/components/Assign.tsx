import { calculateDueDate, cn, isWithinSevenDays } from '@/lib/utils';
import { CourseData } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlarmClock } from 'lucide-react';

interface Props {
  courseData: CourseData[];
}
export default function Assign({ courseData }: Props) {
  if (
    courseData.length === 0 ||
    courseData.some((course) => {
      return !course.data || !course.data.assignData;
    })
  )
    <div className="flex justify-center items-center h-64">
      <Spinner className="h-8 w-8" />
    </div>;

  return (
    <div className="space-y-4">
      {courseData.map((course) => {
        const assignData = course.data?.assignData.filter((data) => {
          return isWithinSevenDays(data.dueDate!);
        });
        if (!course.data || !assignData || assignData.length === 0) return null;

        return assignData.map((assign, index) => {
          let isDueDateSame = true;
          const timeDifference = calculateDueDate(assign.dueDate!);

          return (
            <Card key={`${course.title}-${index}`} className="w-full border-none shadow-md bg-white overflow-hidden">
              <CardHeader
                className={`cursor-pointer flex flex-row items-center justify-between p-4 border-l-4 ${timeDifference.borderColor}`}
              >
                <div className="font-semibold">
                  {course.title} - {course.prof}
                </div>
              </CardHeader>
              <CardContent className="p-4">{`${assign.title}`}</CardContent>
              <CardFooter className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <AlarmClock className="w-5 h-5 text-gray-600" />
                  <span className={`text-sm ${timeDifference.textColor}`}>
                    {isDueDateSame ? timeDifference.message : '확인 필요'}
                  </span>
                </div>
                {assign.isSubmit ? '제출 완료' : '미제출'}
              </CardFooter>
            </Card>
          );
        });
      })}
    </div>
  );
}
