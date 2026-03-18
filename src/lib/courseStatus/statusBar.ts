import i18n from '@/i18n';

const STATUS_BAR_ID = 'dotbugi-status-bar';
const STATUS_BAR_HEIGHT = 36;

const t = (key: string) => i18n.t(key, { ns: 'common' });

const STATUS_BAR_STYLES: Record<string, { bg: string; text: string }> = {
  loading: { bg: '#eff6ff', text: '#1d4ed8' },
  success: { bg: '#f0fdf4', text: '#166534' },
  error: { bg: '#fef2f2', text: '#991b1b' },
};

export function showStatusBar(state: 'loading' | 'success' | 'error') {
  let bar = document.getElementById(STATUS_BAR_ID);
  if (!bar) {
    bar = document.createElement('div');
    bar.id = STATUS_BAR_ID;
    bar.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:99999;
      height:0;opacity:0;overflow:hidden;
      display:flex;align-items:center;justify-content:center;
      gap:8px;font-size:13px;font-weight:500;
      transition:height 0.3s ease,opacity 0.3s ease;
    `;
    document.body.appendChild(bar);
  }

  const { bg, text } = STATUS_BAR_STYLES[state];
  bar.style.background = bg;
  bar.style.color = text;
  bar.style.height = `${STATUS_BAR_HEIGHT}px`;
  bar.style.opacity = '1';
  bar.textContent = t(`courseStatus.bar.${state}`);

  const navbar = document.querySelector<HTMLElement>('.navbar-fixed-top');
  if (navbar) {
    navbar.style.transition = 'top 0.3s ease';
    navbar.style.top = `${STATUS_BAR_HEIGHT}px`;
  }

  if (state !== 'loading') {
    setTimeout(() => {
      bar!.style.height = '0';
      bar!.style.opacity = '0';
      if (navbar) navbar.style.top = '0';
    }, 2000);
  }
}
