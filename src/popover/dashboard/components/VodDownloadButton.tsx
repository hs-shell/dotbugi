import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { VodDownloadState } from '@/hooks/useVodDownload';
import type { Vod } from '@/types';

interface VodDownloadButtonProps {
  vod: Vod;
  download: VodDownloadState;
}

// 대시보드의 다른 아이콘 버튼(DashboardHeader·Setting)과 같은 투명 배경 + hover 회색 패턴
const ICON_BUTTON =
  'group shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-transparent transition-colors duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400';

export default function VodDownloadButton({ vod, download }: VodDownloadButtonProps) {
  const { t } = useTranslation('common');

  if (download.activeUrl === vod.url) {
    // 진행 중에는 % 를 보이고, 올리면 취소(X)로 바뀐다
    return (
      <button
        type="button"
        className={`${ICON_BUTTON} w-auto min-w-7 px-1`}
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
        <X className="w-4 h-4 text-zinc-900 hidden group-hover:block" />
      </button>
    );
  }

  const isBusy = download.activeUrl !== null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          // disabled 는 클릭이 행(강의 창 열기)으로 새므로 흐리게만 하고, 누르면 "이미 다운로드 중" 알림을 띄운다
          className={`${ICON_BUTTON} ${isBusy ? 'opacity-40' : ''}`}
          aria-label={t('vodDownload.button')}
          aria-disabled={isBusy}
          onClick={(e) => {
            // 행 클릭(강의 창 열기)으로 번지지 않게 막는다
            e.stopPropagation();
            download.start(vod);
          }}
        >
          <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{t('vodDownload.notice')}</TooltipContent>
    </Tooltip>
  );
}
