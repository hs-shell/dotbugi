import { Vod, Assign, Quiz } from '@/types';
import { isAttended } from '@/lib/attendance';
import { isCurrentDateByDate, parseDate, calculateDueDate, extractEndDate } from '@/lib/dateUtils';
import { BASE_LINK } from '@/constants/links';
import i18n from '@/i18n';

// ── Types ───────────────────────────────────────────────────────────

type StatusType = 'completed' | 'inProgress' | 'late' | 'absent' | 'urgent' | 'pending' | 'hidden';

interface StatusInfo {
  label: string;
  type: StatusType;
  progress?: number; // 0~100, inProgress 전용
}

// ── Constants ───────────────────────────────────────────────────────

const BADGE_ATTR = 'data-dotbugi-status';

const STATUS_COLORS: Record<StatusType, { bg: string; text: string; border: string }> = {
  completed: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  inProgress: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  late: { bg: '#450a0a', text: '#fecaca', border: '#7f1d1d' },
  absent: { bg: '#450a0a', text: '#fecaca', border: '#7f1d1d' },
  urgent: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
  pending: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  hidden: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
};

const t = (key: string) => i18n.t(key, { ns: 'common' });

// ── Helpers ─────────────────────────────────────────────────────────

function parseTimeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

// ── Status determination ────────────────────────────────────────────

function getVodStatus(vod: Vod): StatusInfo {
  if (isAttended(vod.isAttendance)) {
    return { label: t('courseStatus.vod.completed'), type: 'completed' };
  }

  const rangeEnd = vod.range?.split(' ~ ')[1];
  if (rangeEnd && new Date() > parseDate(rangeEnd)) {
    return { label: t('courseStatus.vod.absent'), type: 'absent' };
  }

  // 수강중: watchedTime > 0 이고 아직 출석 미완료
  if (vod.watchedTime && vod.requiredTime) {
    const watchedSec = parseTimeToSeconds(vod.watchedTime);
    const requiredSec = parseTimeToSeconds(vod.requiredTime);
    if (watchedSec > 0 && requiredSec > 0) {
      const progress = Math.min(100, Math.round((watchedSec / requiredSec) * 100));
      const endDate = extractEndDate(vod.range);
      const remaining = endDate ? calculateDueDate(endDate) : null;
      const suffix =
        remaining && remaining.status !== 'expired' && remaining.status !== 'noInfo'
          ? ` · ${remaining.message}`
          : '';
      const isUrgent = remaining?.status === 'urgent';
      return {
        label: `${t('courseStatus.vod.inProgress')}${suffix}`,
        type: isUrgent ? 'urgent' : 'inProgress',
        progress,
      };
    }
  }

  const endDate = extractEndDate(vod.range);
  const remaining = endDate ? calculateDueDate(endDate) : null;
  const label =
    remaining && remaining.status !== 'expired' && remaining.status !== 'noInfo'
      ? `${t('courseStatus.vod.pending')} · ${remaining.message}`
      : t('courseStatus.vod.pending');
  const type = remaining?.status === 'urgent' ? 'urgent' : 'pending';
  return { label, type };
}

function getDueDateStatus(isSubmit: boolean, dueDate: string | null, labelKey: 'assign' | 'quiz'): StatusInfo {
  if (isSubmit) {
    return { label: t(`courseStatus.${labelKey}.completed`), type: 'completed' };
  }
  if (dueDate && !isCurrentDateByDate(dueDate)) {
    return { label: t(`courseStatus.${labelKey}.absent`), type: 'absent' };
  }
  const remaining = dueDate ? calculateDueDate(dueDate) : null;
  const label =
    remaining && remaining.status !== 'expired' && remaining.status !== 'noInfo'
      ? `${t(`courseStatus.${labelKey}.pending`)} · ${remaining.message}`
      : t(`courseStatus.${labelKey}.pending`);
  const type = remaining?.status === 'urgent' ? 'urgent' : 'pending';
  return { label, type };
}

// ── Badge creation ──────────────────────────────────────────────────

function createBadge({ label, type, progress }: StatusInfo): HTMLElement {
  const { bg, text, border } = STATUS_COLORS[type];
  const badge = document.createElement('span');
  badge.setAttribute(BADGE_ATTR, '');
  badge.textContent = label;

  let background = bg;
  if (progress !== undefined) {
    // 프로그레스 시각화: 왼쪽에서 오른쪽으로 채움색 적용
    const fillColor = type === 'urgent' ? '#fca5a5' : '#93c5fd';
    background = `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${progress}%, ${bg} ${progress}%, ${bg} 100%)`;
  }

  badge.style.cssText = `
    display:inline-flex;align-items:center;padding:2px 8px;margin-left:8px;
    border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;
    background:${background};color:${text};border:1px solid ${border};
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

  if (import.meta.env.VITE_MOCK) {
    injectWeeklyAttendanceDebug(vods);
  }
}

// ── Mock-only: 주차별 출석 상태 디버그 배지 ──────────────────────────

function injectWeeklyAttendanceDebug(vods: Vod[]) {
  const WEEKLY_ATTR = 'data-dotbugi-weekly-debug';
  document.querySelectorAll(`[${WEEKLY_ATTR}]`).forEach((el) => el.remove());

  // 주차별 weeklyAttendance 집계
  const weekMap = new Map<number, string>();
  for (const vod of vods) {
    if (!weekMap.has(vod.week)) {
      weekMap.set(vod.week, vod.weeklyAttendance);
    }
  }

  const sections = document.querySelectorAll('li[id^="section-"]');
  for (const section of sections) {
    const match = section.id?.match(/section-(\d+)/);
    if (!match) continue;
    const week = parseInt(match[1], 10);

    const attendance = weekMap.get(week);
    if (attendance === undefined) continue;

    const attended = isAttended(attendance);
    const badge = document.createElement('span');
    badge.setAttribute(WEEKLY_ATTR, '');
    badge.textContent = `주차 ${attended ? '출석' : '결석'} [${attendance}]`;

    const colors = attended
      ? { bg: '#dcfce7', text: '#166534', border: '#86efac' }
      : { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };

    badge.style.cssText = `
      display:inline-flex;align-items:center;padding:2px 8px;margin-left:8px;
      border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;
      background:${colors.bg};color:${colors.text};border:1px solid ${colors.border};
      white-space:nowrap;vertical-align:middle;
    `;

    section.querySelector('.sectionname span')?.appendChild(badge);
  }
}
