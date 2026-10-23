import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { VodDownloadState } from '@/hooks/useVodDownload';
import type { Vod } from '@/types';

interface VodDownloadButtonProps {
  vod: Vod;
  download: VodDownloadState;
}

export default function VodDownloadButton({ vod, download }: VodDownloadButtonProps) {
  const { t } = useTranslation('common');
  const isActive = download.activeUrl === vod.url;

  if (isActive) {
    return (
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-medium text-zinc-500 tabular-nums">{download.percent}%</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={t('vodDownload.cancel')}
          onClick={download.cancel}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          // 다운로드는 한 번에 하나만 — disabled 는 pointer-events-none 이라 클릭이 행(강의 창 열기)으로 새므로 흐리게만 하고 start 가 무시한다
          className={`h-7 w-7 shrink-0 text-zinc-500 ${download.activeUrl !== null ? 'opacity-50' : ''}`}
          aria-label={t('vodDownload.button')}
          aria-disabled={download.activeUrl !== null}
          onClick={(e) => {
            // 행 클릭(강의 창 열기)으로 번지지 않게 막는다
            e.stopPropagation();
            download.start(vod);
          }}
        >
          <Download />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('vodDownload.notice')}</TooltipContent>
    </Tooltip>
  );
}
