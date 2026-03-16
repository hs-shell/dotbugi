import { Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InfoBubbleProps {
  taskCount: number;
  remainingTime: number;
  onDismiss: () => void;
}

export default function InfoBubble({ taskCount, remainingTime, onDismiss }: InfoBubbleProps) {
  const { t } = useTranslation('common');

  const timeText =
    remainingTime < 60
      ? t('date.minutesAgoShort', { minutes: Math.round(remainingTime) })
      : t('date.hoursAgoShort', { hours: Math.floor(remainingTime / 60) });

  return (
    <div
      className="bg-white rounded-3xl px-5 py-4 mb-3 min-w-[270px] min-h-[70px]"
      style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' }}
    >
      <div className="flex items-start gap-3 p-2">
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-2xl text-zinc-800 leading-tight">
            {t('bubble.tasks', { count: taskCount })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-zinc-500 text-lg">
            <Clock className="w-4 h-4" />
            <span>{t('bubble.updatedAgo', { time: timeText })}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-300 hover:bg-zinc-500 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
