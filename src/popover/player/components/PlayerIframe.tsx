import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const formatMMSS = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

interface PlayerIframeProps {
  videoSrc: string;
  onNextVideo: () => void;
  isPlaying: boolean;
}

export default function PlayerIframe({ videoSrc, onNextVideo, isPlaying }: PlayerIframeProps) {
  const { t } = useTranslation('player');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const onNextVideoRef = useRef(onNextVideo);

  const [time, setTime] = useState({ current: 0, duration: 0 });

  const setIframeRef = (node: HTMLIFrameElement | null) => {
    iframeRef.current = node;
    if (node) {
      node.addEventListener('load', loadEventListener);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const video = getVideoElement();
      if (video) {
        setTime({ current: video.currentTime, duration: video.duration });
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onNextVideoRef.current = onNextVideo;
  }, [isPlaying, onNextVideo]);

  const getVideoElement = () => {
    const iframe = iframeRef.current;
    if (!iframe) return null;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      return (doc?.querySelector('video') as HTMLVideoElement | null) ?? null;
    } catch (err) {
      console.error('iframe access error', err);
      return null;
    }
  };

  const controlPlayback = (video: HTMLVideoElement | null, play: boolean) => {
    if (!video) return;
    if (play) {
      video.muted = false;
      video.volume = 0.01;
      video.play().catch((e) => console.warn('Playback failed:', e));
    } else {
      video.pause();
    }
  };

  const loadEventListener = () => {
    const video = getVideoElement();
    if (!video) return;

    video.onended = null;
    video.onended = () => onNextVideoRef.current();

    controlPlayback(video, isPlayingRef.current);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.addEventListener('load', loadEventListener);
    return () => iframe.removeEventListener('load', loadEventListener);
  }, [videoSrc]);

  useEffect(() => {
    controlPlayback(getVideoElement(), isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = getVideoElement();
      if (video && !video.paused) {
        video.play().catch(() => {});
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-full items-center justify-center rounded-xl ${!isPlaying && 'bg-black'}`}>
      <div
        className={`absolute inset-0 flex items-center justify-center text-white
          text-6xl font-bold bg-transparent pointer-events-none`}
      >
        {isPlaying ? (
          time.duration > 0 ? (
            <div className="flex items-center justify-center p-8 bg-zinc-950 bg-opacity-80 rounded-xl">
              <span className="flex items-center justify-center text-white min-w-[4ch]">
                {formatMMSS(time.current)}{' '}
              </span>
              <span className="flex items-center justify-center text-zinc-300"> / </span>
              <span className="flex items-center justify-center text-zinc-300 min-w-[4ch]">
                {formatMMSS(time.duration)}
              </span>
            </div>
          ) : (
            <div>{t('noVideoInfo')}</div>
          )
        ) : (
          <div className="flex justify-center items-center text-center text-3xl">
            {t('startPrompt')}
          </div>
        )}
      </div>

      {videoSrc && isPlaying && (
        <iframe
          ref={setIframeRef}
          src={videoSrc}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
          allow="autoplay"
          width="100%"
          height="100%"
          className="rounded-lg pointer-events-none"
        />
      )}
    </div>
  );
}
