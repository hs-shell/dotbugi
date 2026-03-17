import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type NotificationType = 'success' | 'error' | 'warning' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  autoDismiss?: boolean;
  action?: {
    labelKey: string;
    onClick: () => void;
  };
}

interface NotificationBubbleProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  loading: Loader2,
};

const ICON_COLOR_MAP = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-orange-500',
  loading: 'text-zinc-400 animate-spin',
};

export default function NotificationBubble({ notifications, onDismiss }: NotificationBubbleProps) {
  return (
    <AnimatePresence>
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (!notification.autoDismiss) return;
    const timer = setTimeout(() => onDismiss(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification.id, notification.autoDismiss, onDismiss]);

  const { t } = useTranslation('common');
  const Icon = ICON_MAP[notification.type];
  const message = t(notification.messageKey, notification.messageParams);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl px-5 py-4 min-w-[270px]"
      style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)' }}
    >
      <div className="flex items-start gap-3 p-2">
        <motion.div
          key={notification.type}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${ICON_COLOR_MAP[notification.type]}`} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.p
            key={notification.messageKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-lg text-zinc-800 leading-snug"
          >
            {message}
          </motion.p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 px-3 py-1.5 text-base font-semibold text-white bg-zinc-800 hover:bg-zinc-900 rounded-xl transition-colors"
            >
              {t(notification.action.labelKey)}
            </button>
          )}
        </div>
        {notification.type !== 'loading' && (
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-300 hover:bg-zinc-500 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
