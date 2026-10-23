import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { VodDownloadState } from '@/hooks/useVodDownload';
import type { Vod } from '@/types';

interface VodDownloadButtonProps {
  vod: Vod;
  download: VodDownloadState;
}

// 평소엔 투명, hover·누름에서 배경이 드러나는 아이콘 버튼 (DashboardHeader·Setting 의 hover 회색 패턴)
const ICON_BUTTON =
  'group shrink-0 h-8 min-w-8 flex items-center justify-center rounded-md bg-transparent cursor-pointer transition-colors duration-150 hover:bg-zinc-200 active:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400';

export default function VodDownloadButton({ vod, download }: VodDownloadButtonProps) {
  const { t } = useTranslation('common');

  if (download.activeUrl === vod.url) {
    // 진행 중에는 % 를 보이고, 올리면 취소(X)로 바뀐다
    return (
      <button
        type="button"
        className={`${ICON_BUTTON} px-1`}
        aria-label={t('vodDownload.cancel')}
        title={t('vodDownload.cancel')}
        onClick={(e) => {
          e.stopPropagation();
          download.cancel();
        }}
      >
        <span className="text-xs font-semibold text-amber-500 tabular-nums group-hover:hidden">
          {download.percent}%
        </span>
        <X className="w-[18px] h-[18px] text-zinc-900 hidden group-hover:block" />
      </button>
    );
  }

  const isBusy = download.activeUrl !== null;
  return (
    <button
      type="button"
      // disabled 는 클릭이 행(강의 창 열기)으로 새므로 흐리게만 하고, 누르면 "이미 다운로드 중" 알림을 띄운다
      className={`${ICON_BUTTON} ${isBusy ? 'opacity-40' : ''}`}
      aria-label={t('vodDownload.button')}
      aria-disabled={isBusy}
      // Radix Tooltip 은 포커스로도 열리고(저장 대화상자에서 돌아올 때 등) shadow root 밖 body 로 포털돼
      // 대시보드 아래에 스타일 없이 떠서, 마우스를 올렸을 때만 뜨는 기본 title 을 쓴다
      title={t('vodDownload.notice')}
      onClick={(e) => {
        // 행 클릭(강의 창 열기)으로 번지지 않게 막는다
        e.stopPropagation();
        download.start(vod);
      }}
    >
      <Download className="w-[18px] h-[18px] text-zinc-500 group-hover:text-zinc-900 transition-colors" />
    </button>
  );
}
