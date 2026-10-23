import { logger } from '@/lib/logger';
import { downloadVod, removeFile } from './download';
import { EncryptedHlsError } from './playlist';

/** i18n 키 `vodDownload.<결과>` 와 이름을 맞춘다 (dismissed 는 저장 대화상자를 닫은 경우라 알리지 않음) */
export type VodDownloadResult = 'done' | 'cancelled' | 'failed' | 'encrypted' | 'unsupported' | 'busy' | 'dismissed';

export interface ActiveVodDownload {
  vodUrl: string;
  percent: number;
}

// 대시보드와 강의 페이지 버튼이 같은 content script 모듈을 공유하므로 페이지 전체에서 한 번에 하나만 받는다
let active: AbortController | null = null;
let snapshot: ActiveVodDownload | null = null;
const listeners = new Set<() => void>();

function setSnapshot(next: ActiveVodDownload | null) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

/** 어느 버튼에서 시작했든 진행 상태를 보여 주도록 구독한다 (useSyncExternalStore 형식) */
export function subscribeVodDownload(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActiveVodDownload(): ActiveVodDownload | null {
  return snapshot;
}

// 같은 탭에서 다른 페이지로 가면 다운로드가 조용히 끊기므로 브라우저 확인 창으로 한 번 막는다
function warnBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = '';
}

/**
 * 저장 위치를 고르게 한 뒤 VOD 를 받는다. 반드시 클릭 핸들러 안에서 불러야 한다(사용자 제스처).
 * onProgress(0) 이 실제 다운로드 시작 신호다.
 */
export async function runVodDownload(
  vodUrl: string,
  fileName: string,
  onProgress: (ratio: number) => void
): Promise<VodDownloadResult> {
  if (active) return 'busy';
  if (!window.showSaveFilePicker) return 'unsupported';

  let handle: FileSystemFileHandle;
  try {
    handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: 'MP4', accept: { 'video/mp4': ['.mp4'] } }],
    });
  } catch {
    return 'dismissed';
  }
  // 대화상자가 열린 사이 다른 버튼에서 시작했을 수 있다 — 대화상자가 만든 빈 파일은 지운다
  if (active) {
    await removeFile(handle);
    return 'busy';
  }

  const controller = new AbortController();
  active = controller;
  window.addEventListener('beforeunload', warnBeforeUnload);
  const report = (ratio: number) => {
    setSnapshot({ vodUrl, percent: Math.floor(ratio * 100) });
    onProgress(ratio);
  };
  try {
    report(0);
    await downloadVod(vodUrl, handle, controller.signal, report);
    return 'done';
  } catch (error) {
    if (controller.signal.aborted) return 'cancelled';
    // 오류 메시지에는 URL 을 넣지 않으므로 그대로 남겨도 토큰이 새지 않는다
    logger.general.warn('VOD 다운로드 실패:', error);
    return error instanceof EncryptedHlsError ? 'encrypted' : 'failed';
  } finally {
    active = null;
    setSnapshot(null);
    window.removeEventListener('beforeunload', warnBeforeUnload);
  }
}

export function cancelVodDownload(): void {
  active?.abort();
}
