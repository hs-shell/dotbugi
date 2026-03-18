import { CheckCircle, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface InfoBubbleProps {
  taskCount: number;
  remainingTime: number;
  onDismiss: () => void;
}

export default function InfoBubble({ taskCount, remainingTime, onDismiss }: InfoBubbleProps) {
  const { t } = useTranslation('common');
  const allDone = taskCount === 0;

  const isStale = remainingTime >= 30;
  const timeText =
    remainingTime < 60
      ? t('date.minutesAgoShort', { minutes: Math.round(remainingTime) })
      : t('date.hoursAgoShort', { hours: Math.floor(remainingTime / 60) });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl px-5 py-4 mb-3 min-w-[270px] min-h-[70px]"
      style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)' }}
    >
      <div className="flex items-start gap-3 p-2">
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-2xl text-zinc-800 leading-tight flex items-center gap-2">
            {allDone && <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />}
            {allDone ? t('bubble.allDone') : t('bubble.tasks', { count: taskCount })}
          </div>
          <div className={`flex items-center gap-2 mt-2 text-lg ${isStale ? 'text-orange-500' : 'text-zinc-500'}`}>
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
    </motion.div>
  );
}
