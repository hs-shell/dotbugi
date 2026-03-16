import thung from '@/assets/thung.png';

interface EmptyStateProps {
  label: string;
}

export default function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <img src={thung} width={100} height={100} />
      <div>
        <span className="py-3 text-2xl font-medium">{label}가 없습니다</span>
      </div>
    </div>
  );
}
