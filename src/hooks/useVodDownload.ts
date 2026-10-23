import { useCallback, useState } from 'react';

import { cancelVodDownload, runVodDownload } from '@/lib/vodDownload/controller';
import { toVodFileName } from '@/lib/vodDownload/fileName';
import type { Notification } from '@/popover/dashboard/components/NotificationBubble';
import type { Vod } from '@/types';

export interface VodDownloadState {
  /** 이 대시보드에서 받고 있는 VOD 의 url */
  activeUrl: string | null;
  percent: number;
  start: (vod: Vod) => void;
  cancel: () => void;
}

/** VOD 다운로드 진행 상태 — 대시보드 탭을 옮겨도 이어지도록 항상 마운트된 Dashboard 에서 쓴다 */
export function useVodDownload(notify: (n: Omit<Notification, 'id'>) => void): VodDownloadState {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);

  const start = useCallback(
    async (vod: Vod) => {
      const result = await runVodDownload(
        vod.url,
        toVodFileName([vod.courseTitle, vod.subject, vod.title]),
        (ratio) => {
          setActiveUrl(vod.url);
          setPercent(Math.floor(ratio * 100));
        }
      );
      setActiveUrl((current) => (current === vod.url ? null : current));
      if (result === 'dismissed') return;
      const type = result === 'done' ? 'success' : result === 'cancelled' || result === 'busy' ? 'warning' : 'error';
      notify({ type, messageKey: `vodDownload.${result}`, autoDismiss: true });
    },
    [notify]
  );

  return { activeUrl, percent, start, cancel: cancelVodDownload };
}
