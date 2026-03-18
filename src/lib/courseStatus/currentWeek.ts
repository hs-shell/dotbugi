import i18n from '@/i18n';

const CURRENT_WEEK_ATTR = 'data-dotbugi-current-week';
const SCROLL_BTN_ID = 'dotbugi-scroll-current-week';

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const t = (key: string) => i18n.t(key, { ns: 'common' });

// ── Date parsing ────────────────────────────────────────────────────

function inferYearFromSection(section: Element): number | null {
  const m = section.querySelector('.text-ubstrap')?.textContent?.trim()?.match(/(\d{4})-/);
  return m ? parseInt(m[1]) : null;
}

function inferYear(sections: NodeListOf<Element>): number {
  for (const s of sections) {
    const y = inferYearFromSection(s);
    if (y) return y;
  }
  return new Date().getFullYear();
}

function parseLocalizedDate(str: string, year: number): Date | null {
  let m: RegExpMatchArray | null;

  // Korean: 3월18일 / Chinese: 03月04日
  m = str.match(/(\d{1,2})월\s*(\d{1,2})일/) ?? str.match(/(\d{1,2})月(\d{1,2})日/);
  if (m) return new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));

  // Japanese: 03/04
  m = str.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) return new Date(year, parseInt(m[1]) - 1, parseInt(m[2]));

  // English: 04 March
  m = str.match(/(\d{1,2})\s+([A-Za-z]+)/);
  if (m && MONTH_NAMES[m[2].toLowerCase()]) {
    return new Date(year, MONTH_NAMES[m[2].toLowerCase()] - 1, parseInt(m[1]));
  }

  return null;
}

function parseSectionDateRange(text: string, year: number): { start: Date; end: Date } | null {
  const match = text.match(/\[([^\]]+)\]/);
  if (!match) return null;

  const [startStr, endStr] = match[1].split(/\s*-\s*/);
  if (!startStr || !endStr) return null;

  const start = parseLocalizedDate(startStr.trim(), year);
  const end = parseLocalizedDate(endStr.trim(), year);
  if (!start || !end) return null;

  end.setHours(23, 59, 59);
  return { start, end };
}

// ── Highlight & scroll button ───────────────────────────────────────

export function highlightCurrentWeek() {
  const now = new Date();
  const sections = document.querySelectorAll('li[id^="section-"]');
  const fallbackYear = inferYear(sections);
  let currentWeekTarget: Element | null = null;

  for (const section of sections) {
    if (section.querySelector(`[${CURRENT_WEEK_ATTR}]`)) continue;

    const year = inferYearFromSection(section) ?? fallbackYear;
    const name = section.querySelector('.sectionname')?.textContent?.trim();
    if (!name) continue;

    const range = parseSectionDateRange(name, year);
    if (!range || now < range.start || now > range.end) continue;

    currentWeekTarget = section;

    const content = section.querySelector('.content') as HTMLElement | null;
    if (!content) continue;

    content.style.borderLeft = '4px solid #3b82f6';
    content.style.paddingLeft = '12px';
    content.style.borderRadius = '4px';

    const marker = document.createElement('span');
    marker.setAttribute(CURRENT_WEEK_ATTR, '');
    marker.textContent = t('courseStatus.currentWeek');
    marker.style.cssText = `
      display:inline-flex;align-items:center;padding:2px 8px;margin-left:8px;
      border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;
      background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;
      white-space:nowrap;vertical-align:middle;
    `;

    section.querySelector('.sectionname span')?.appendChild(marker);
  }

  if (currentWeekTarget && !document.getElementById(SCROLL_BTN_ID)) {
    const target = currentWeekTarget;
    const btn = document.createElement('button');
    btn.id = SCROLL_BTN_ID;
    btn.textContent = t('courseStatus.goToCurrentWeek');
    btn.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;
      display:inline-flex;align-items:center;gap:6px;padding:10px 18px;
      border-radius:24px;font-size:13px;font-weight:600;color:#fff;
      background:#3b82f6;border:none;cursor:pointer;transition:all 0.3s;
      box-shadow:0 4px 12px rgba(59,130,246,0.4);
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#2563eb';
      btn.style.boxShadow = '0 6px 16px rgba(59,130,246,0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#3b82f6';
      btn.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
    });
    btn.addEventListener('click', () => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.body.appendChild(btn);
  }
}
