import { useCallback, useSyncExternalStore } from 'react';

import {
  cancelVodDownload,
  getActiveVodDownload,
  getSavedCmids,
  runVodDownload,
  subscribeVodDownload,
} from '@/lib/vodDownload/controller';
import { toCmid } from '@/lib/vodDownload/extractM3u8';
import { toVodFileName } from '@/lib/vodDownload/fileName';
import type { Notification } from '@/popover/dashboard/components/NotificationBubble';
import type { Vod } from '@/types';

export interface VodDownloadState {
  /** 받고 있는 VOD 의 url — 강의 페이지 버튼에서 시작한 것도 포함 (한 번에 하나) */
  activeUrl: string | null;
  percent: number;
  /** 이번 페이지에서 받기를 마쳤는지 (새로 고칠 때까지 체크 표시) */
  isSaved: (vod: Vod) => boolean;
  start: (vod: Vod) => void;
  cancel: () => void;
}

/** VOD 다운로드 진행 상태 — 대시보드 탭을 옮겨도 이어지도록 항상 마운트된 Dashboard 에서 쓴다 */
export function useVodDownload(notify: (n: Omit<Notification, 'id'>) => void): VodDownloadState {
  const active = useSyncExternalStore(subscribeVodDownload, getActiveVodDownload);
  const savedCmids = useSyncExternalStore(subscribeVodDownload, getSavedCmids);

  const start = useCallback(
    async (vod: Vod) => {
      const fileName = toVodFileName([vod.courseTitle, vod.subject, vod.title]);
      const result = await runVodDownload(vod.url, fileName, (ratio) => {
        if (ratio === 0) notify({ type: 'loading', messageKey: 'vodDownload.started', autoDismiss: true });
      });
      if (result === 'dismissed') return;
      const type = result === 'done' ? 'success' : result === 'cancelled' || result === 'busy' ? 'warning' : 'error';
      notify({ type, messageKey: `vodDownload.${result}`, autoDismiss: true });
    },
    [notify]
  );

  const isSaved = useCallback((vod: Vod) => savedCmids.has(toCmid(vod.url) ?? ''), [savedCmids]);

  return {
    activeUrl: active?.vodUrl ?? null,
    percent: active?.percent ?? 0,
    isSaved,
    start,
    cancel: cancelVodDownload,
  };
}
