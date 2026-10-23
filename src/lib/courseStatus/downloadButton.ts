import i18n from '@/i18n';
import { cancelVodDownload, runVodDownload } from '@/lib/vodDownload/controller';

export const DOWNLOAD_HOST_ATTR = 'data-dotbugi-download';

const MESSAGE_DURATION_MS = 4000;

const t = (key: string) => i18n.t(key, { ns: 'common' });

// lucide download / x 아이콘 (정적 문자열 — 사용자 값은 넣지 않는다)
const DOWNLOAD_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';
const CANCEL_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

// 페이지 CSS 가 닿지 않도록 Shadow DOM 안에 두고, 배지(badge.ts)와 같은 알약 모양·글꼴 크기를 쓴다
const STYLE = `
:host{all:initial;display:inline-flex;align-items:center;gap:6px;margin-left:6px;vertical-align:middle;
  font:600 11px/1.4 system-ui,-apple-system,sans-serif}
button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;
  height:24px;min-width:24px;padding:0 4px;border-radius:6px;cursor:pointer;color:#71717a;
  transition:background .15s,color .15s}
button:hover{background:#e4e4e7;color:#18181b}
button:active{background:#d4d4d8}
button:focus-visible{outline:2px solid #a1a1aa;outline-offset:1px}
button[hidden],span[hidden]{display:none}
svg{width:16px;height:16px}
.progress{color:#f59e0b;font-variant-numeric:tabular-nums}
.cancel svg{display:none}
.cancel:hover .progress{display:none}
.cancel:hover svg{display:block}
.msg{font-weight:500;color:#b91c1c}
.msg.ok{color:#166534}
`;

/** 강의 페이지 VOD 항목 옆에 붙는 다운로드 버튼 (진행률·취소·짧은 안내 문구 포함) */
export function createDownloadButton(vodUrl: string, cmid: string, fileName: string): HTMLElement {
  const host = document.createElement('span');
  host.setAttribute(DOWNLOAD_HOST_ATTR, cmid);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${STYLE}</style>
<button type="button" class="start">${DOWNLOAD_ICON}</button>
<button type="button" class="cancel" hidden><span class="progress"></span>${CANCEL_ICON}</button>
<span class="msg" hidden></span>`;

  const start = root.querySelector('.start') as HTMLButtonElement;
  const cancel = root.querySelector('.cancel') as HTMLButtonElement;
  const progress = root.querySelector('.progress') as HTMLSpanElement;
  const msg = root.querySelector('.msg') as HTMLSpanElement;
  start.title = t('vodDownload.notice');
  start.setAttribute('aria-label', t('vodDownload.button'));
  cancel.title = t('vodDownload.cancel');
  cancel.setAttribute('aria-label', t('vodDownload.cancel'));

  let msgTimer: ReturnType<typeof setTimeout> | undefined;
  const showMessage = (key: string, ok = false) => {
    clearTimeout(msgTimer);
    msg.textContent = t(key);
    msg.classList.toggle('ok', ok);
    msg.hidden = false;
    msgTimer = setTimeout(() => (msg.hidden = true), MESSAGE_DURATION_MS);
  };

  // 버튼이 활동 링크 근처에 있어 클릭이 링크 이동·LMS 핸들러로 번지지 않게 막는다
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  start.addEventListener('click', async (e) => {
    swallow(e);
    msg.hidden = true;
    const result = await runVodDownload(vodUrl, fileName, (ratio) => {
      start.hidden = true;
      cancel.hidden = false;
      progress.textContent = `${Math.floor(ratio * 100)}%`;
    });
    start.hidden = false;
    cancel.hidden = true;
    if (result !== 'dismissed') showMessage(`vodDownload.${result}`, result === 'done');
  });

  cancel.addEventListener('click', (e) => {
    swallow(e);
    cancelVodDownload();
  });

  return host;
}
