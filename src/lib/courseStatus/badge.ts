import { Vod, Assign, Quiz } from '@/types';
import { isAttended } from '@/lib/attendance';
import { isCurrentDateByDate, parseDate } from '@/lib/dateUtils';
import { BASE_LINK } from '@/constants/links';
import i18n from '@/i18n';

// ── Types ───────────────────────────────────────────────────────────

type StatusType = 'completed' | 'absent' | 'pending' | 'hidden';

interface StatusInfo {
  label: string;
  type: StatusType;
}

// ── Constants ───────────────────────────────────────────────────────

const BADGE_ATTR = 'data-dotbugi-status';

const STATUS_COLORS: Record<StatusType, { bg: string; text: string; border: string }> = {
  completed: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  absent: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  pending: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  hidden: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
};

const t = (key: string) => i18n.t(key, { ns: 'common' });

// ── Status determination ────────────────────────────────────────────

function getVodStatus(vod: Vod): StatusInfo {
  if (isAttended(vod.isAttendance)) {
    return { label: t('courseStatus.vod.completed'), type: 'completed' };
  }
  const rangeEnd = vod.range?.split(' ~ ')[1];
  if (rangeEnd && new Date() > parseDate(rangeEnd)) {
    return { label: t('courseStatus.vod.absent'), type: 'absent' };
  }
  return { label: t('courseStatus.vod.pending'), type: 'pending' };
}

function getDueDateStatus(isSubmit: boolean, dueDate: string | null, labelKey: 'assign' | 'quiz'): StatusInfo {
  if (isSubmit) {
    return { label: t(`courseStatus.${labelKey}.completed`), type: 'completed' };
  }
  if (dueDate && !isCurrentDateByDate(dueDate)) {
    return { label: t(`courseStatus.${labelKey}.absent`), type: 'absent' };
  }
  return { label: t(`courseStatus.${labelKey}.pending`), type: 'pending' };
}

// ── Badge creation ──────────────────────────────────────────────────

function createBadge({ label, type }: StatusInfo): HTMLElement {
  const { bg, text, border } = STATUS_COLORS[type];
  const badge = document.createElement('span');
  badge.setAttribute(BADGE_ATTR, '');
  badge.textContent = label;
  badge.style.cssText = `
    display:inline-flex;align-items:center;padding:2px 8px;margin-left:8px;
    border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;
    background:${bg};color:${text};border:1px solid ${border};
    white-space:nowrap;vertical-align:middle;
  `;
  return badge;
}

function normalizeUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return BASE_LINK + (url.startsWith('/') ? '' : '/') + url;
}

// ── Badge injection ─────────────────────────────────────────────────

function injectBadgesForSelector<T>(
  selector: string,
  dataMap: Map<string, T>,
  getStatus: (item: T) => StatusInfo,
  hiddenUrls: Set<string>,
  hiddenStatus: StatusInfo,
) {
  document.querySelectorAll(selector).forEach((activity) => {
    const link = activity.querySelector('a') as HTMLAnchorElement | null;
    const nameEl = activity.querySelector('.instancename');
    if (!link || !nameEl) return;

    const url = normalizeUrl(link.href);

    if (hiddenUrls.has(url)) {
      nameEl.appendChild(createBadge(hiddenStatus));
      return;
    }

    const item = dataMap.get(url);
    if (item) nameEl.appendChild(createBadge(getStatus(item)));
  });
}

export function injectBadgesIntoDOM(vods: Vod[], assigns: Assign[], quizzes: Quiz[], hiddenUrls: Set<string>) {
  document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => el.remove());

  const hidden: StatusInfo = { label: t('courseStatus.hidden'), type: 'hidden' };

  injectBadgesForSelector(
    'li.modtype_vod:not(.dimmed) .activityinstance',
    new Map(vods.map((v) => [v.url, v])),
    getVodStatus,
    hiddenUrls,
    hidden,
  );

  injectBadgesForSelector(
    'li.modtype_assign:not(.dimmed) .activityinstance',
    new Map(assigns.map((a) => [a.url, a])),
    (a) => getDueDateStatus(a.isSubmit, a.dueDate, 'assign'),
    hiddenUrls,
    hidden,
  );

  injectBadgesForSelector(
    'li.modtype_quiz:not(.dimmed) .activityinstance',
    new Map(quizzes.map((q) => [q.url, q])),
    (q) => getDueDateStatus(q.isSubmit, q.dueDate, 'quiz'),
    hiddenUrls,
    hidden,
  );
}
