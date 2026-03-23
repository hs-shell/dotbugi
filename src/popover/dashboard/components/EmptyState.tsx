import thung from '@/assets/thung.webp';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  label: 'vod' | 'assign' | 'quiz';
}

export default function EmptyState({ label }: EmptyStateProps) {
  const { t } = useTranslation('common');
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <img src={thung} width={100} height={100} />
      <div>
        <span className="py-3 text-2xl font-medium">{t(`empty.${label}`)}</span>
      </div>
    </div>
  );
}
