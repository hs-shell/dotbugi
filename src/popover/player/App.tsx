import { useState, useEffect } from 'react';
import PlayerPopoverTrigger from './components/PlayerPopoverTrigger';
import PlayerPopoverContent from './components/PlayerPopoverContent';
import { Popover } from '@/components/ui/popover';

export default function PlayerApp() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPlaying) {
        e.preventDefault();
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPlaying]);

  return (
    <Popover open={isPopoverOpen}>
      <PlayerPopoverTrigger onClick={() => setIsPopoverOpen((prev) => !prev)} isPlaying={isPlaying} />
      <PlayerPopoverContent isPopoverOpen={isPopoverOpen} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </Popover>
  );
}
