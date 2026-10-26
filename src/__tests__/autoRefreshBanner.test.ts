import { afterEach, describe, expect, it, vi } from 'vitest';

import { removeAutoRefreshBanner, renderAutoRefreshBanner } from '@/lib/autoRefreshBanner';

const banner = () => document.getElementById('dotbugi-auto-refresh-banner');
const link = () => banner()?.querySelector('a');

afterEach(() => {
  removeAutoRefreshBanner();
});

describe('자동 새로고침 꺼짐 배너', () => {
  it('마지막 새로고침 시각과 새로고침 링크를 표시하고, 링크를 누르면 onRefresh 를 부른다', () => {
    const onRefresh = vi.fn();
    renderAutoRefreshBanner('오후 3:00:00', 'idle', onRefresh);

    expect(banner()?.textContent).toContain('autoRefresh.banner.off');
    expect(banner()?.textContent).toContain('time:오후 3:00:00');
    link()!.click();
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('새로고침 기록이 없으면 그렇게 표시한다', () => {
    renderAutoRefreshBanner(null, 'idle', () => {});
    expect(banner()?.textContent).toContain('autoRefresh.banner.never');
  });

  it('새로고침 중에는 링크 대신 진행 문구를 표시한다', () => {
    renderAutoRefreshBanner('오후 3:00:00', 'loading', () => {});
    expect(link()).toBeNull();
    expect(banner()?.textContent).toContain('autoRefresh.banner.loading');
  });

  it('실패하면 실패 문구와 다시 시도할 링크를 표시한다', () => {
    renderAutoRefreshBanner('오후 3:00:00', 'error', () => {});
    expect(banner()?.textContent).toContain('autoRefresh.banner.error');
    expect(link()).not.toBeNull();
  });

  it('다시 그려도 배너는 하나이고, 지우면 사라진다', () => {
    renderAutoRefreshBanner(null, 'idle', () => {});
    renderAutoRefreshBanner('오후 3:00:00', 'idle', () => {});
    expect(document.querySelectorAll('#dotbugi-auto-refresh-banner')).toHaveLength(1);
    removeAutoRefreshBanner();
    expect(banner()).toBeNull();
  });
});
