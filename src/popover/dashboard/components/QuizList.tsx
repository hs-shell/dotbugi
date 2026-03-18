import { Quiz } from '@/types';
import DueDateList from './DueDateList';
import { useTranslation } from 'react-i18next';

interface QuizTabProps {
  courseData: Quiz[];
  onHideTask?: (url: string) => void;
}

export default function QuizList({ courseData, onHideTask }: QuizTabProps) {
  const { t } = useTranslation('common');
  return (
    <DueDateList
      courseData={courseData}
      emptyLabel="quiz"
      getBorderClass={(item, timeDiff) => (item.isSubmit ? 'border-green-500' : timeDiff.borderColor)}
      getStatusIcon={(item, timeDiff) => {
        if (item.isSubmit) return 'check';
        if (timeDiff.textColor.includes('red')) return 'siren';
        return 'warning';
      }}
      getStatusColor={(item, timeDiff) => (item.isSubmit ? 'text-green-500' : timeDiff.textColor)}
      getStatusLabel={(item) => (item.isSubmit ? t('submit.doneSpaced') : t('submit.neededSpaced'))}
      onHideTask={onHideTask}
    />
  );
}
