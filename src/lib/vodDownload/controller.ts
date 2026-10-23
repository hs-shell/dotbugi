import { logger } from '@/lib/logger';
import { downloadVod, removeFile } from './download';
import { toCmid } from './extractM3u8';
import { EncryptedHlsError } from './playlist';

const MP4_TYPES: FilePickerAcceptType[] = [{ description: 'MP4', accept: { 'video/mp4': ['.mp4'] } }];

/** i18n 키 `vodDownload.<결과>` 와 이름을 맞춘다 (dismissed 는 저장 대화상자를 닫은 경우라 알리지 않음) */
export type VodDownloadResult = 'done' | 'cancelled' | 'failed' | 'encrypted' | 'unsupported' | 'busy' | 'dismissed';

export interface ActiveVodDownload {
  vodUrl: string;
  percent: number;
}

// 대시보드와 강의 페이지 버튼이 같은 content script 모듈을 공유하므로 페이지 전체에서 한 번에 하나만 받는다
let active: AbortController | null = null;
let snapshot: ActiveVodDownload | null = null;
// 받기를 마친 VOD(cmid) 의 저장 파일 — 모듈 메모리라 페이지를 새로 고치면 사라진다
const savedHandles = new Map<string, FileSystemFileHandle>();
let savedCmids: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

function setSnapshot(next: ActiveVodDownload | null) {
  snapshot = next;
  notify();
}

/** 어느 버튼에서 시작했든 진행 상태를 보여 주도록 구독한다 (useSyncExternalStore 형식) */
export function subscribeVodDownload(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActiveVodDownload(): ActiveVodDownload | null {
  return snapshot;
}

/** 받기를 마친 VOD 의 cmid 목록 (바뀔 때마다 새 Set 이라 useSyncExternalStore 스냅샷으로 쓸 수 있다) */
export function getSavedCmids(): ReadonlySet<string> {
  return savedCmids;
}

function markSaved(vodUrl: string, handle: FileSystemFileHandle) {
  const cmid = toCmid(vodUrl);
  if (!cmid) return;
  savedHandles.set(cmid, handle);
  savedCmids = new Set(savedHandles.keys());
  notify();
}

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

/**
 * 저장한 파일이 있는 폴더에서 파일 열기 대화상자를 연다 (확장 권한 없이 저장 위치를 보여 줄 수 있는 유일한 방법).
 * 고른 파일로는 아무것도 하지 않는다. 클릭 핸들러 안에서 불러야 한다.
 */
export async function openSavedLocation(vodUrl: string): Promise<void> {
  const cmid = toCmid(vodUrl);
  const handle = cmid ? savedHandles.get(cmid) : undefined;
  if (!handle || !window.showOpenFilePicker) return;
  try {
    await window.showOpenFilePicker({ startIn: handle, types: MP4_TYPES });
  } catch (error) {
    if (isAbortError(error)) return;
    // startIn 에 핸들을 못 쓰는 환경이면 기본 위치로라도 연다
    await window.showOpenFilePicker({ types: MP4_TYPES }).catch(() => {});
  }
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
      types: MP4_TYPES,
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
    markSaved(vodUrl, handle);
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
