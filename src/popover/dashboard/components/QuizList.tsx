import { Quiz } from '@/types';
import DueDateList from './DueDateList';
import { useTranslation } from 'react-i18next';

interface QuizTabProps {
  courseData: Quiz[];
}

export default function QuizList({ courseData }: QuizTabProps) {
  const { t } = useTranslation('common');
  return (
    <DueDateList
      courseData={courseData}
      emptyLabel="quiz"
      getBorderClass={(_, timeDiff) => timeDiff.borderColor}
      getStatusIcon={(_, timeDiff) => (timeDiff.textColor.includes('red') ? 'siren' : 'warning')}
      getStatusColor={(_, timeDiff) => timeDiff.textColor}
      getStatusLabel={() => t('status.checkManually')}
    />
  );
}
