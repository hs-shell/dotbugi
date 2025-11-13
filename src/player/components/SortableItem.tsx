import { Vod } from '@/content/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dispatch, SetStateAction } from 'react';

interface SortableItemProps {
  vod: Vod;
  idx: number;
  currentVideoIndex: number;
  setCurrentVideoIndex: Dispatch<SetStateAction<number>>;
}
export default function SortableItem({ vod, idx, currentVideoIndex, setCurrentVideoIndex }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${vod.week}-${vod.title}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setCurrentVideoIndex(idx)}
      className={`p-3 rounded-lg transition-all flex-shrink-0 ${
        idx === currentVideoIndex
          ? 'bg-white border border-blue-400'
          : 'bg-zinc-50 border border-transparent hover:border-zinc-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xl font-semibold text-black truncate">{vod.title}</p>
          <p className="text-lg text-zinc-600 truncate">
            {vod.courseTitle} - {vod.prof}
          </p>
        </div>
      </div>
    </div>
  );
}
