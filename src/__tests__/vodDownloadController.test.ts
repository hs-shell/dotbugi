import { afterEach, describe, expect, it, vi } from 'vitest';

import { cancelVodDownload, runVodDownload } from '@/lib/vodDownload/controller';
import { downloadVod } from '@/lib/vodDownload/download';

vi.mock('@/lib/vodDownload/download', () => ({ downloadVod: vi.fn() }));

const handle = {} as FileSystemFileHandle;

describe('runVodDownload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

    await expect(runVodDownload('u2', 'b.mp4', () => {})).resolves.toBe('busy');

    finish();
    await expect(first).resolves.toBe('done');
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', addSpy.mock.calls[0][1]);
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
