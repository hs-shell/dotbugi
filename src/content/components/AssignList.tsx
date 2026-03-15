import { Assign } from '../types';
import DueDateList from './DueDateList';

interface AssignmentProps {
  courseData: Assign[];
}

export default function AssignList({ courseData }: AssignmentProps) {
  return (
    <DueDateList
      courseData={courseData}
      emptyLabel="과제"
      getBorderClass={(item, timeDiff) => (item.isSubmit ? 'border-green-500' : timeDiff.borderColor)}
      getStatusIcon={(item, timeDiff) => {
        if (item.isSubmit) return 'check';
        if (timeDiff.textColor.includes('red')) return 'siren';
        return 'warning';
      }}
      getStatusColor={(item, timeDiff) => (item.isSubmit ? 'text-green-500' : timeDiff.textColor)}
      getStatusLabel={(item) => (item.isSubmit ? '제출 완료' : '제출 필요')}
    />
  );
}
