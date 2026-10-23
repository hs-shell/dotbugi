import { useCallback, useSyncExternalStore } from 'react';

import {
  cancelVodDownload,
  getActiveVodDownload,
  runVodDownload,
  subscribeVodDownload,
} from '@/lib/vodDownload/controller';
import { toVodFileName } from '@/lib/vodDownload/fileName';
import type { Notification } from '@/popover/dashboard/components/NotificationBubble';
import type { Vod } from '@/types';

export interface VodDownloadState {
  /** 받고 있는 VOD 의 url — 강의 페이지 버튼에서 시작한 것도 포함 (한 번에 하나) */
  activeUrl: string | null;
  percent: number;
  start: (vod: Vod) => void;
  cancel: () => void;
}

/** VOD 다운로드 진행 상태 — 대시보드 탭을 옮겨도 이어지도록 항상 마운트된 Dashboard 에서 쓴다 */
export function useVodDownload(notify: (n: Omit<Notification, 'id'>) => void): VodDownloadState {
  const active = useSyncExternalStore(subscribeVodDownload, getActiveVodDownload);

  const start = useCallback(
    async (vod: Vod) => {
      const fileName = toVodFileName([vod.courseTitle, vod.subject, vod.title]);
      const result = await runVodDownload(vod.url, fileName, (ratio) => {
        // 시작할 때 한 번 본인 학습용·재배포 금지 안내를 띄운다
        if (ratio === 0) notify({ type: 'loading', messageKey: 'vodDownload.started', autoDismiss: true });
      });
      if (result === 'dismissed') return;
      const type = result === 'done' ? 'success' : result === 'cancelled' || result === 'busy' ? 'warning' : 'error';
      notify({ type, messageKey: `vodDownload.${result}`, autoDismiss: true });
    },
    [notify]
  );

  return { activeUrl: active?.vodUrl ?? null, percent: active?.percent ?? 0, start, cancel: cancelVodDownload };
}
