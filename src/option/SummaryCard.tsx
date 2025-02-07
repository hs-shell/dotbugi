import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import useCardData from '@/hooks/useCardData';
import { Zap, Video, NotebookTextIcon } from 'lucide-react';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardItemProps {
  title: string;
  icon: ReactNode;
  data: { done: number; total: number }[];
  color: string;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
};

export default function SummaryCard() {
  //   const { vodSummary, assignSummary, quizSummary } = useCardData();

  const CardItem = ({ title, icon, data, color }: CardItemProps) => {
    const done = data.length > 0 ? data[0].done : 0;
    const total = data.length > 0 ? data[0].total : 1;
    const percentage = Math.round((done / total) * 100);
    const bgColorClass = colorMap[color] || 'bg-gray-500'; // 기본값 설정

    return (
      <Card className="w-full shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
          {icon}
        </CardHeader>
        <CardContent>
          {title.includes('퀴즈') ? (
            <div className="text-2xl font-bold">{data.length > 0 ? `${total} 개` : '0 개'}</div>
          ) : (
            <div className="text-2xl font-bold">{data.length > 0 ? `${done} / ${total}` : '0 개'}</div>
          )}
          {title.includes('퀴즈') ? (
            <div />
          ) : (
            <Progress value={percentage} className={clsx('h-2 mt-2')} indicatorColor={bgColorClass} />
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {title.includes('퀴즈') ? '직접 확인' : percentage + '% 완료'}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <CardItem title="동영상 강의" icon={<Video className="h-4 w-4 text-blue-500" />} data={[]} color="blue" />
      <CardItem title="과제" icon={<NotebookTextIcon className="h-4 w-4 text-violet-500" />} data={[]} color="violet" />
      <CardItem title="퀴즈" icon={<Zap className="h-4 w-4 text-amber-500" />} data={[]} color="amber" />
      {/* <CardItem title="동영상 강의" icon={<Video className="h-4 w-4 text-blue-500" />} data={vodSummary} color="blue" />
      <CardItem
        title="과제"
        icon={<NotebookTextIcon className="h-4 w-4 text-violet-500" />}
        data={assignSummary}
        color="violet"
      />
      <CardItem title="퀴즈" icon={<Zap className="h-4 w-4 text-amber-500" />} data={quizSummary} color="amber" /> */}
    </div>
  );
}
