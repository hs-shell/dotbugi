import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { VodDownloadState } from '@/hooks/useVodDownload';
import type { Vod } from '@/types';

interface VodDownloadButtonProps {
  vod: Vod;
  download: VodDownloadState;
}

// 강의 페이지 버튼(downloadButton.ts)과 같은 비율·색. rem 은 LMS 페이지 html 글꼴 크기를 따라 달라지므로 px·hex 로 고정한다
const ICON_BUTTON =
  'group shrink-0 h-[28px] min-w-[28px] p-[6px] flex items-center justify-center rounded-[6px] border border-transparent bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[#e4e4e7] active:bg-[#d4d4d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa]';
const ICON = 'w-[16px] h-[16px] shrink-0';

export default function VodDownloadButton({ vod, download }: VodDownloadButtonProps) {
  const { t } = useTranslation('common');

  if (download.activeUrl === vod.url) {
    // 진행 중에는 % 를 보이고, 올리면 취소(X)로 바뀐다
    return (
      <button
        type="button"
        className={`${ICON_BUTTON} px-[4px]`}
        aria-label={t('vodDownload.cancel')}
        onClick={(e) => {
          e.stopPropagation();
          download.cancel();
        }}
      >
        <span className="text-[11px] font-semibold text-[#f59e0b] tabular-nums group-hover:hidden">
          {download.percent}%
        </span>
        <X className={`${ICON} text-[#18181b] hidden group-hover:block`} />
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
      <Download className={`${ICON} text-[#71717a] group-hover:text-[#18181b] transition-colors`} />
    </button>
  );
}
