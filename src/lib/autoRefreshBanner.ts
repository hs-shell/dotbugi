import i18n from '@/i18n';

const BANNER_ID = 'dotbugi-auto-refresh-banner';
const BANNER_HEIGHT = 36;
// 주황(amber): 빨강은 "새로고침 실패" 상태 바와 겹쳐 보여 주의 수준 색을 쓴다
const BANNER_BG = '#fffbeb';
const BANNER_TEXT = '#92400e';

export type AutoRefreshBannerState = 'idle' | 'loading' | 'error';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, { ns: 'common', ...options });

/** 고정 상단 바만큼 LMS 상단 내비게이션과 본문을 내린다 */
function shiftPage(offset: number) {
  const navbar = document.querySelector<HTMLElement>('.navbar-fixed-top');
  if (navbar) navbar.style.top = offset ? `${offset}px` : '';
  document.body.style.marginTop = offset ? `${offset}px` : '';
}

/** 자동 새로고침이 꺼져 있을 때 상단에 계속 띄우는 배너. 다시 부르면 내용만 바꾼다 */
export function renderAutoRefreshBanner(
  lastRefreshed: string | null,
  state: AutoRefreshBannerState,
  onRefresh: () => void
) {
  let banner = document.getElementById(BANNER_ID);
  if (!banner) {
    banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'status');
    banner.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:99999;height:${BANNER_HEIGHT}px;
      display:flex;align-items:center;justify-content:center;gap:8px;
      font-size:13px;font-weight:500;background:${BANNER_BG};color:${BANNER_TEXT};
    `;
    document.body.appendChild(banner);
    shiftPage(BANNER_HEIGHT);
  }

  const parts = [
    t('autoRefresh.banner.off'),
    lastRefreshed ? t('autoRefresh.banner.last', { time: lastRefreshed }) : t('autoRefresh.banner.never'),
  ];
  if (state === 'error') parts.push(t('autoRefresh.banner.error'));
  banner.replaceChildren(parts.join(' · '));

  if (state === 'loading') {
    banner.append(` · ${t('autoRefresh.banner.loading')}`);
    return;
  }
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = t('autoRefresh.banner.refresh');
  link.style.cssText = `color:${BANNER_TEXT};text-decoration:underline;font-weight:700;cursor:pointer;`;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    onRefresh();
  });
  banner.append(' · ', link);
}

export function removeAutoRefreshBanner() {
  const banner = document.getElementById(BANNER_ID);
  if (!banner) return;
  banner.remove();
  shiftPage(0);
}
