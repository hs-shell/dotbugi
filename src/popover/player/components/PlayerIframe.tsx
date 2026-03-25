import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/logger';

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
  const abortRef = useRef<AbortController | null>(null);

  const [time, setTime] = useState({ current: 0, duration: 0 });

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onNextVideoRef.current = onNextVideo;
  }, [isPlaying, onNextVideo]);

  const getVideoElement = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return null;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      return (doc?.querySelector('video') as HTMLVideoElement | null) ?? null;
    } catch {
      return null;
    }
  }, []);

  const controlPlayback = useCallback((video: HTMLVideoElement | null, play: boolean) => {
    if (!video) return;
    if (play) {
      video.muted = false;
      video.volume = 0.01;
      video.play().catch((e) => logger.player.warn('Playback failed:', e));
    } else {
      video.pause();
    }
  }, []);

  // iframe load 시: 메타 fetch → 스킵 or 이어보기 or 재생
  const handleLoad = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // 이전 fetch 취소
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 메타 fetch
    try {
      const res = await fetch(iframe.src, { credentials: 'include', signal: controller.signal });
      const html = await res.text();

      if (controller.signal.aborted) return;

      const completeMatch = html.match(/var\s+is_complete\s*=\s*(\d+)/);
      const progressMatch = html.match(/var\s+before_progress\s*=\s*(\d+)/);
      const isComplete = completeMatch?.[1] === '1';
      const beforeProgress = progressMatch ? parseInt(progressMatch[1], 10) : 0;

      logger.player.info('handleLoad meta:', {
        src: iframe.src,
        isComplete,
        beforeProgress,
        isPlaying: isPlayingRef.current,
      });

      // is_complete면 스킵
      if (isComplete && isPlayingRef.current) {
        logger.player.info('Skipping completed video:', iframe.src);
        onNextVideoRef.current();
        return;
      }

      const video = getVideoElement();
      if (!video) {
        logger.player.warn('Video element not found after meta fetch');
        return;
      }

      video.onended = null;
      video.onended = () => {
        logger.player.info('Video ended naturally:', {
          src: iframe.src,
          currentTime: video.currentTime,
          duration: video.duration,
        });
        onNextVideoRef.current();
      };

      // 이어보기
      if (!isComplete && beforeProgress > 0) {
        const trySeek = () => {
          if (controller.signal.aborted) return;
          if (video.readyState >= 1 && video.duration > 0) {
            const seekTo = Math.min(beforeProgress, video.duration - 1);
            logger.player.info('Resuming from', seekTo, 'duration:', video.duration);
            video.currentTime = seekTo;
          } else {
            setTimeout(trySeek, 500);
          }
        };
        trySeek();
      }

      controlPlayback(video, isPlayingRef.current);
    } catch {
      // fetch 실패 시 일반 재생
      if (controller.signal.aborted) return;
      logger.player.warn('Meta fetch failed, falling back to normal playback');
      const video = getVideoElement();
      if (!video) return;
      video.onended = null;
      video.onended = () => onNextVideoRef.current();
      controlPlayback(video, isPlayingRef.current);
    }
  }, [getVideoElement, controlPlayback]);

  // callback ref: iframe mount 시 즉시 load 리스너 등록
  const setIframeRef = useCallback(
    (node: HTMLIFrameElement | null) => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleLoad);
      }
      iframeRef.current = node;
      if (node) {
        node.addEventListener('load', handleLoad);
      }
    },
    [handleLoad],
  );

  // 시간 표시
  useEffect(() => {
    const interval = setInterval(() => {
      const video = getVideoElement();
      if (video) {
        setTime({ current: video.currentTime, duration: video.duration });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [getVideoElement]);

  useEffect(() => {
    controlPlayback(getVideoElement(), isPlaying);
  }, [isPlaying, controlPlayback, getVideoElement]);

  // cleanup abort on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // 백그라운드 탭 fallback
  useEffect(() => {
    const interval = setInterval(() => {
      const video = getVideoElement();
      if (!video || !isPlayingRef.current) return;

      if (video.paused) {
        logger.player.info('Resuming paused video in background tab');
        video.play().catch(() => {});
      }

      if (video.duration > 0 && video.currentTime >= video.duration - 0.5) {
        logger.player.info('Fallback: advancing to next video', {
          currentTime: video.currentTime,
          duration: video.duration,
        });
        onNextVideoRef.current();
      }
    }, 3_000);
    return () => clearInterval(interval);
  }, [getVideoElement]);

  return (
    <div className={`relative w-full h-full items-center justify-center rounded-xl ${!isPlaying && 'bg-black'}`}>
      {isPlaying ? (
        time.duration > 0 ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg pointer-events-none text-xl font-medium z-10">
            <span className="text-white">{formatMMSS(time.current)}</span>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-400">{formatMMSS(time.duration)}</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-medium pointer-events-none">
            {t('noVideoInfo')}
          </div>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-medium pointer-events-none">
          {t('startPrompt')}
        </div>
      )}

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
