import { afterEach, describe, expect, it, vi } from 'vitest';

import { cancelVodDownload, getActiveVodDownload, runVodDownload } from '@/lib/vodDownload/controller';
import { downloadVod, removeFile } from '@/lib/vodDownload/download';

vi.mock('@/lib/vodDownload/download', () => ({ downloadVod: vi.fn(), removeFile: vi.fn() }));

const handle = {} as FileSystemFileHandle;

describe('runVodDownload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    delete window.showSaveFilePicker;
  });

  it('한 번에 하나만 받고, 진행 중에는 이탈 경고를 건다', async () => {
    window.showSaveFilePicker = vi.fn().mockResolvedValue(handle);
    let finish!: () => void;
    vi.mocked(downloadVod).mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const first = runVodDownload('u1', 'a.mp4', () => {});
    await vi.waitFor(() => expect(downloadVod).toHaveBeenCalled());
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    // 다른 버튼(대시보드 등)이 구독해 볼 수 있는 진행 상태
    expect(getActiveVodDownload()).toEqual({ vodUrl: 'u1', percent: 0 });
    await expect(runVodDownload('u2', 'b.mp4', () => {})).resolves.toBe('busy');

    finish();
    await expect(first).resolves.toBe('done');
    expect(getActiveVodDownload()).toBeNull();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', addSpy.mock.calls[0][1]);
  });

  it('저장 대화상자가 열린 사이 다른 다운로드가 시작되면 busy 로 끝내고 빈 파일을 지운다', async () => {
    let pick!: (h: FileSystemFileHandle) => void;
    const picked = { name: 'second' } as unknown as FileSystemFileHandle;
    window.showSaveFilePicker = vi
      .fn()
      .mockImplementationOnce(() => new Promise<FileSystemFileHandle>((resolve) => (pick = resolve)))
      .mockResolvedValueOnce(handle);
    let finish!: () => void;
    vi.mocked(downloadVod).mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));

    const second = runVodDownload('u2', 'b.mp4', () => {}); // 대화상자 열림 (아직 선택 전)
    const first = runVodDownload('u1', 'a.mp4', () => {});
    await vi.waitFor(() => expect(downloadVod).toHaveBeenCalled());
    pick(picked);

    await expect(second).resolves.toBe('busy');
    expect(removeFile).toHaveBeenCalledWith(picked);
    finish();
    await first;
  });

  it('취소하면 cancelled, 저장 대화상자를 닫으면 dismissed, 미지원이면 unsupported', async () => {
    await expect(runVodDownload('u', 'a.mp4', () => {})).resolves.toBe('unsupported');

    window.showSaveFilePicker = vi.fn().mockRejectedValue(new DOMException('', 'AbortError'));
    await expect(runVodDownload('u', 'a.mp4', () => {})).resolves.toBe('dismissed');

    window.showSaveFilePicker = vi.fn().mockResolvedValue(handle);
    vi.mocked(downloadVod).mockImplementation(
      (_url, _handle, signal) =>
        new Promise<void>((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)))
    );
    const running = runVodDownload('u', 'a.mp4', () => {});
    await vi.waitFor(() => expect(downloadVod).toHaveBeenCalled());
    cancelVodDownload();
    await expect(running).resolves.toBe('cancelled');
  });
});
