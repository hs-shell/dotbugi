import { useCallback, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import { downloadVod } from '@/lib/vodDownload/download';
import { toVodFileName } from '@/lib/vodDownload/fileName';
import { EncryptedHlsError } from '@/lib/vodDownload/playlist';
import type { Notification } from '@/popover/dashboard/components/NotificationBubble';
import type { Vod } from '@/types';

export interface VodDownloadState {
  /** 받고 있는 VOD 의 url (한 번에 하나만) */
  activeUrl: string | null;
  percent: number;
  start: (vod: Vod) => void;
  cancel: () => void;
}

/** VOD 다운로드 진행 상태 — 대시보드 탭을 옮겨도 이어지도록 항상 마운트된 Dashboard 에서 쓴다 */
export function useVodDownload(notify: (n: Omit<Notification, 'id'>) => void): VodDownloadState {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (vod: Vod) => {
      if (controllerRef.current) return;
      if (!window.showSaveFilePicker) {
        notify({ type: 'error', messageKey: 'vodDownload.unsupported', autoDismiss: true });
        return;
      }

      let handle: FileSystemFileHandle;
      try {
        handle = await window.showSaveFilePicker({
          suggestedName: toVodFileName([vod.courseTitle, vod.subject, vod.title]),
          types: [{ description: 'MP4', accept: { 'video/mp4': ['.mp4'] } }],
        });
      } catch {
        return; // 저장 대화상자를 닫은 경우
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setActiveUrl(vod.url);
      setPercent(0);
      try {
        await downloadVod(vod.url, handle, controller.signal, (ratio) => setPercent(Math.floor(ratio * 100)));
        notify({ type: 'success', messageKey: 'vodDownload.done', autoDismiss: true });
      } catch (error) {
        if (controller.signal.aborted) {
          notify({ type: 'warning', messageKey: 'vodDownload.cancelled', autoDismiss: true });
        } else {
          // 오류 메시지에는 URL 을 넣지 않으므로 그대로 남겨도 토큰이 새지 않는다
          logger.general.warn('VOD 다운로드 실패:', error);
          const messageKey = error instanceof EncryptedHlsError ? 'vodDownload.encrypted' : 'vodDownload.failed';
          notify({ type: 'error', messageKey, autoDismiss: true });
        }
      } finally {
        controllerRef.current = null;
        setActiveUrl(null);
      }
    },
    [notify]
  );

  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  return { activeUrl, percent, start, cancel };
}
