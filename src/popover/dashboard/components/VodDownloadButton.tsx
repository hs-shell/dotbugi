import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { VodDownloadState } from '@/hooks/useVodDownload';
import type { Vod } from '@/types';

interface VodDownloadButtonProps {
  vod: Vod;
  download: VodDownloadState;
}

// 평소엔 투명, 행 배경(연파랑) 위에서도 hover·누름이 확실히 보이도록 파랑 계열로 (강의 페이지 버튼과 같은 색)
const ICON_BUTTON =
  'group shrink-0 h-8 min-w-8 flex items-center justify-center rounded-md border border-transparent bg-transparent cursor-pointer transition-colors duration-150 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export default function VodDownloadButton({ vod, download }: VodDownloadButtonProps) {
  const { t } = useTranslation('common');

  if (download.activeUrl === vod.url) {
    // 진행 중에는 % 를 보이고, 올리면 취소(X)로 바뀐다
    return (
      <button
        type="button"
        className={`${ICON_BUTTON} px-1`}
        aria-label={t('vodDownload.cancel')}
        onClick={(e) => {
          e.stopPropagation();
          download.cancel();
        }}
      >
        <span className="text-xs font-semibold text-amber-500 tabular-nums group-hover:hidden">
          {download.percent}%
        </span>
        <X className="w-[18px] h-[18px] text-blue-700 hidden group-hover:block" />
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
      // 툴팁(Radix·title)은 대시보드 아래에 떠 보여서 두지 않고, 안내 문구는 시작 알림에 넣는다
      onClick={(e) => {
        // 행 클릭(강의 창 열기)으로 번지지 않게 막는다
        e.stopPropagation();
        download.start(vod);
      }}
    >
      <Download className="w-[18px] h-[18px] text-zinc-500 group-hover:text-blue-700 transition-colors" />
    </button>
  );
}
