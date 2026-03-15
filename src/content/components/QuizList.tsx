import { Quiz } from '../types';
import DueDateList from './DueDateList';

interface QuizTabProps {
  courseData: Quiz[];
}

export default function QuizList({ courseData }: QuizTabProps) {
  return (
    <DueDateList
      courseData={courseData}
      emptyLabel="퀴즈"
      getBorderClass={(_, timeDiff) => timeDiff.borderColor}
      getStatusIcon={(_, timeDiff) => (timeDiff.textColor.includes('red') ? 'siren' : 'warning')}
      getStatusColor={(_, timeDiff) => timeDiff.textColor}
      getStatusLabel={() => '직접 확인'}
    />
  );
}
