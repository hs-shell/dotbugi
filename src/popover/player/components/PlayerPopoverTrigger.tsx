import { useEffect, useRef, useState } from 'react';
import { PopoverTrigger } from '@/components/ui/popover';
import icon from '@/assets/icon.png';
import { BorderTrail } from '@/components/ui/border-trail';

interface PlayerPopoverTriggerProps {
  onClick: () => void;
  isPlaying: boolean;
}

export default function PlayerPopoverTrigger({ onClick, isPlaying }: PlayerPopoverTriggerProps) {
  const containerRef = useRef<HTMLLIElement>(null);
  const [parentWidth, setParentWidth] = useState<number>(0);

  useEffect(() => {
    const root = containerRef.current?.getRootNode() as ShadowRoot | Document | null;
    const host = (root instanceof ShadowRoot ? root.host : null) as HTMLElement | null;

    if (!host) return console.warn('dotbugi-player host not found');

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setParentWidth(entry.contentRect.width);
    });

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const isCompact = parentWidth < 190;

  return (
    <PopoverTrigger asChild>
      <li
        ref={containerRef}
        onClick={onClick}
        className="relative flex justify-center items-center text-white text-2xl 
                   font-bold cursor-pointer h-[61px] px-4 bg-transparent overflow-visible"
      >
        <div className="flex w-full justify-start items-center z-10 px-4">
          <img src={icon} alt="돋부기 아이콘" className={`${isCompact ? 'w-6 h-6 mr-2' : 'w-10 h-10 mr-4'}`} />
          <div className="flex justify-between w-full items-center">
            {!isCompact && <h5 className="m-1">돋부기 🔎</h5>}
            <span className={`w-4 h-4 rounded-full ${isPlaying ? 'bg-green-700' : 'bg-red-700'}`} />
          </div>
        </div>

        <BorderTrail
          className="absolute inset-0 z-[9999] pointer-events-none 
                     bg-gradient-to-r from-white/10 via-white/80 to-white/10
                     dark:from-white/10 dark:via-white/60 dark:to-white/10"
          style={{
            boxShadow: `
              0 0 25px 10px rgba(255,255,255,0.4),
              0 0 60px 30px rgba(255,255,255,0.25),
              inset 0 0 25px rgba(255,255,255,0.3)
            `,
            filter: 'blur(0.4px)',
          }}
          size={50}
        />
      </li>
    </PopoverTrigger>
  );
}
