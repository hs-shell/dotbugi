import { useState, useEffect } from 'react';
import PlayerPopoverTrigger from './components/PlayerPopoverTrigger';
import PlayerPopoverContent from './components/PlayerPopoverContent';
import { Popover } from '@/components/ui/popover';
import { useUnattendedVods } from './hooks/useUnattendedVods';

export default function PlayerApp() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { vods, setVods, loadUnattendedVods } = useUnattendedVods(isPlaying);

  // 팝오버를 열 때 목록이 비어 있으면 스토리지에서 불러온다 (최초 열기가 곧 첫 로드).
  const handleTriggerClick = () => {
    if (!isPopoverOpen && !isPlaying && vods.length === 0) loadUnattendedVods();
    setIsPopoverOpen((prev) => !prev);
  };

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
      <PlayerPopoverTrigger onClick={handleTriggerClick} isPlaying={isPlaying} />
      <PlayerPopoverContent
        isPopoverOpen={isPopoverOpen}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        vods={vods}
        setVods={setVods}
      />
    </Popover>
  );
}
