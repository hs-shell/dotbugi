import { Vod } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

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

  const itemRef = useRef<HTMLDivElement>(null);
  const isCurrent = idx === currentVideoIndex;

  useEffect(() => {
    if (isCurrent && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isCurrent]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setCurrentVideoIndex(idx)}
      className={`p-3 rounded-lg transition-all flex-shrink-0 ${
        isCurrent
          ? 'bg-blue-50 border-l-4 border-blue-500 border-y border-r border-y-transparent border-r-transparent'
          : 'bg-zinc-50 border-l-4 border-transparent hover:bg-zinc-100'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`text-lg font-bold mt-0.5 flex-shrink-0 ${isCurrent ? 'text-blue-500' : 'text-zinc-400'}`}>
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-xl font-semibold truncate ${isCurrent ? 'text-blue-700' : 'text-black'}`}>{vod.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-lg text-zinc-500 truncate">
              {vod.courseTitle}
            </p>
            <span className="text-zinc-300">·</span>
            <span className="text-lg text-zinc-400 flex-shrink-0">{vod.length.trim()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
