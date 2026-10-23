import i18n from '@/i18n';
import {
  cancelVodDownload,
  getActiveVodDownload,
  getSavedCmids,
  runVodDownload,
  subscribeVodDownload,
} from '@/lib/vodDownload/controller';
import { toCmid } from '@/lib/vodDownload/extractM3u8';

export const DOWNLOAD_HOST_ATTR = 'data-dotbugi-download';

const MESSAGE_DURATION_MS = 4000;

const t = (key: string) => i18n.t(key, { ns: 'common' });

// lucide download / x / check 아이콘 (정적 문자열 — 사용자 값은 넣지 않는다)
const DOWNLOAD_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';
const CANCEL_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

// 페이지 CSS 가 닿지 않도록 Shadow DOM 안에 두고, 배지(badge.ts)와 같은 알약 모양·글꼴 크기를 쓴다
const STYLE = `
:host{all:initial;display:inline-flex;align-items:center;gap:6px;margin-left:6px;vertical-align:middle;
  font:600 11px/1.4 system-ui,-apple-system,sans-serif}
button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:4px;
  height:24px;min-width:24px;padding:0 3px;border-radius:6px;cursor:pointer;color:#71717a;
  border:1px solid transparent;transition:background .15s,color .15s,border-color .15s}
button:hover{background:#e4e4e7;color:#18181b}
button:active{background:#d4d4d8}
button:focus-visible{outline:2px solid #a1a1aa;outline-offset:1px}
button[hidden],.saved[hidden],.msg:empty{display:none}
.saved{display:inline-flex;align-items:center;justify-content:center;height:24px;min-width:24px;padding:0 4px;
  box-sizing:border-box;color:#16a34a;cursor:default}
.saved svg{animation:saved-in 250ms cubic-bezier(.34,1.56,.64,1) both}
@keyframes saved-in{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.saved svg{animation:none}}
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
<span class="saved" role="img" hidden>${CHECK_ICON}</span>
<span class="msg" role="status" aria-live="polite"></span>`;

  const start = root.querySelector('.start') as HTMLButtonElement;
  const cancel = root.querySelector('.cancel') as HTMLButtonElement;
  const saved = root.querySelector('.saved') as HTMLSpanElement;
  const progress = root.querySelector('.progress') as HTMLSpanElement;
  const msg = root.querySelector('.msg') as HTMLSpanElement;
  // 저장된 언어는 버튼을 만든 뒤 비동기로 적용될 수 있어 언어가 바뀔 때마다 다시 단다. title 툴팁은 두지 않는다
  const applyLabels = () => {
    start.setAttribute('aria-label', t('vodDownload.button'));
    cancel.setAttribute('aria-label', t('vodDownload.cancel'));
    saved.setAttribute('aria-label', t('vodDownload.saved'));
  };
  applyLabels();
  i18n.on('languageChanged', applyLabels);

  let msgTimer: ReturnType<typeof setTimeout> | undefined;
  const showMessage = (key: string, ok = false) => {
    clearTimeout(msgTimer);
    msg.textContent = t(key);
    msg.classList.toggle('ok', ok);
    msgTimer = setTimeout(() => (msg.textContent = ''), MESSAGE_DURATION_MS);
  };

  // 대시보드에서 시작·완료한 다운로드도 같이 보이도록 공용 상태에서 그린다 (받은 강의는 새로 고칠 때까지 초록 체크)
  const render = () => {
    const active = getActiveVodDownload();
    const isActive = active !== null && toCmid(active.vodUrl) === cmid;
    const isSaved = getSavedCmids().has(cmid);
    start.hidden = isActive || isSaved;
    saved.hidden = isActive || !isSaved;
    cancel.hidden = !isActive;
    if (active && isActive) progress.textContent = `${active.percent}%`;
  };
  render();
  subscribeVodDownload(render);

  // 버튼이 활동 링크 근처에 있어 클릭이 링크 이동·LMS 핸들러로 번지지 않게 막는다
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  start.addEventListener('click', async (e) => {
    swallow(e);
    msg.textContent = '';
    const result = await runVodDownload(vodUrl, fileName, (ratio) => {
      if (ratio === 0) showMessage('vodDownload.started', true);
    });
    if (result !== 'dismissed') showMessage(`vodDownload.${result}`, result === 'done');
  });

  cancel.addEventListener('click', (e) => {
    swallow(e);
    cancelVodDownload();
  });

  return host;
}
