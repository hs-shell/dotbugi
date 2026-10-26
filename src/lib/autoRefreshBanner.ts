import i18n from '@/i18n';

const BANNER_ID = 'dotbugi-auto-refresh-banner';
const BANNER_HEIGHT = 36;
// 주황(amber): 빨강은 "새로고침 실패" 상태 바와 겹쳐 보여 주의 수준 색을 쓴다
const BANNER_BG = '#fffbeb';
const BANNER_TEXT = '#92400e';
const DOTS_CLASS = 'dotbugi-loading-dots';
const DOTS_STYLE_ID = 'dotbugi-loading-dots-style';
// 점이 . → .. → ... 로 늘었다 다시 하나로 돌아간다. 폭을 고정해 가운데 정렬된 문구가 흔들리지 않게 한다
const DOTS_CSS = `
@keyframes dotbugi-loading-dots { 0% { content: '.'; } 33% { content: '..'; } 66% { content: '...'; } }
.${DOTS_CLASS}::after { content: '.'; animation: dotbugi-loading-dots 1.2s steps(1) infinite; }
.${DOTS_CLASS} { display: inline-block; width: 1.2em; text-align: left; }
`;

export type AutoRefreshBannerState = 'idle' | 'loading' | 'error';

const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, { ns: 'common', ...options });

/** 시·분만 표시 (초는 생략) */
const formatTime = (time: number) => new Date(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/** 점 애니메이션 키프레임은 인라인 스타일로 쓸 수 없어 문서에 한 번만 넣는다 */
function ensureDotsStyle() {
  if (document.getElementById(DOTS_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DOTS_STYLE_ID;
  style.textContent = DOTS_CSS;
  document.head.appendChild(style);
}

/** 고정 상단 바만큼 LMS 상단 내비게이션과 본문을 내린다 */
function shiftPage(offset: number) {
  const navbar = document.querySelector<HTMLElement>('.navbar-fixed-top');
  if (navbar) navbar.style.top = offset ? `${offset}px` : '';
  document.body.style.marginTop = offset ? `${offset}px` : '';
}

/** 자동 새로고침이 꺼져 있을 때 상단에 계속 띄우는 배너. 다시 부르면 내용만 바꾼다 */
export function renderAutoRefreshBanner(
  lastRefreshedAt: number | null,
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
    lastRefreshedAt
      ? t('autoRefresh.banner.last', { time: formatTime(lastRefreshedAt) })
      : t('autoRefresh.banner.never'),
  ];
  if (state === 'error') parts.push(t('autoRefresh.banner.error'));
  banner.replaceChildren(parts.join(' · '));

  if (state === 'loading') {
    ensureDotsStyle();
    const dots = document.createElement('span');
    dots.className = DOTS_CLASS;
    dots.setAttribute('aria-hidden', 'true');
    banner.append(` · ${t('autoRefresh.banner.loading')}`, dots);
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
