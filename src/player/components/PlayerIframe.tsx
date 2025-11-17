import { useEffect, useRef, useState } from 'react';

interface PlayerIframeProps {
  videoSrc: string;
  onNextVideo: () => void;
  isPlaying: boolean;
}

export default function PlayerIframe({ videoSrc, onNextVideo, isPlaying }: PlayerIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const onNextVideoRef = useRef(onNextVideo);

  const [time, setTime] = useState({ current: 0, duration: 0 });

  // iframe 랜더링 시 이벤트 등록
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

  // iframe 내 video 요소 접근 헬퍼
  const getVideoElement = () => {
    const iframe = iframeRef.current;
    if (!iframe) return null;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      return (doc?.querySelector('video') as HTMLVideoElement | null) ?? null;
    } catch (err) {
      console.error('iframe 접근 에러', err);
      return null;
    }
  };

  // 재생, 일시정지 처리 함수
  const controlPlayback = (video: HTMLVideoElement | null, play: boolean) => {
    if (!video) return;
    if (play) {
      video.muted = false;
      video.volume = 0.01;
      video.play().catch((e) => console.warn('재생 실패:', e));
    } else {
      video.pause();
    }
  };

  // load 이벤트 시 video listener 세팅
  const loadEventListener = () => {
    const video = getVideoElement();
    if (!video) return;

    // 중복 방지
    video.onended = null;
    video.onended = () => onNextVideoRef.current();

    controlPlayback(video, isPlayingRef.current);
  };

  // iframe load 이벤트 연결
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.addEventListener('load', loadEventListener);
    return () => iframe.removeEventListener('load', loadEventListener);
  }, [videoSrc]);

  // isPlaying 변경 시 재생 상태 제어
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
                {Math.floor(time.current / 60)}:
                {Math.floor(time.current % 60)
                  .toString()
                  .padStart(2, '0')}{' '}
              </span>
              <span className="flex items-center justify-center text-zinc-300"> / </span>
              <span className="flex items-center justify-center text-zinc-300 min-w-[4ch]">
                {Math.floor(time.duration / 60)}:
                {Math.floor(time.duration % 60)
                  .toString()
                  .padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div>영상 정보가 없습니다</div>
          )
        ) : (
          <div className="flex justify-center items-center text-center text-3xl">
            자동수강을 시작하려면 수강시작 버튼을 눌러주세요
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
