import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { injectBadgesIntoDOM } from '@/lib/courseStatus/badge';
import type { Assign, Quiz, Vod } from '@/types';

vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }));

const PUBLISHED = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=101';
const UNPUBLISHED = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=1220559';
const ASSIGN = 'https://learn.hansung.ac.kr/mod/assign/view.php?id=301';
const ASSIGN_UNPUBLISHED = 'https://learn.hansung.ac.kr/mod/assign/view.php?id=302';

// 일반 VOD 1개 + 아직 공개 전(사용 제한) VOD 1개 — 공개 전 강의는 li 가 아니라 안쪽 링크에 dimmed 가 붙는다
const COURSE_PAGE = `
<ul>
  <li class="activity modtype_vod">
    <div class="activityinstance"><a href="${PUBLISHED}"><span class="instancename">배열</span></a></div>
  </li>
  <li class="activity vod modtype_vod " id="module-1220559">
    <div class="availability dimmed"><div class="availabilityinfo "><strong>2026년 10월 29일</strong> 부터 사용가능</div>
    <div class="activityinstance">
      <a class=" dimmed conditionalhidden" href="${UNPUBLISHED}"><span class="accesshide ">학생에게 비공개:동영상</span><span class="instancename">미공개</span></a>
    </div></div>
  </li>
  <li class="activity modtype_assign">
    <div class="activityinstance"><a href="${ASSIGN}"><span class="instancename">과제1</span></a></div>
  </li>
  <li class="activity assign modtype_assign " id="module-302">
    <div class="availability dimmed"><div class="availabilityinfo "><strong>2026년 10월 29일</strong> 부터 사용가능</div>
    <div class="activityinstance">
      <a class=" dimmed conditionalhidden" href="${ASSIGN_UNPUBLISHED}"><span class="instancename">과제2</span></a>
    </div></div>
  </li>
</ul>`;

describe('injectBadgesIntoDOM', () => {
  it('아직 공개 전 VOD·과제에는 상태 배지를 붙이지 않는다', () => {
    document.body.innerHTML = COURSE_PAGE;
    const vod = (url: string) =>
      ({ url, isAttendance: 'X', range: '2024-12-01 00:00:00 ~ 2028-12-30 23:59:00' }) as unknown as Vod;

    const assign = (url: string) => ({ url, isSubmit: false, dueDate: null }) as unknown as Assign;

    injectBadgesIntoDOM(
      [vod(PUBLISHED), vod(UNPUBLISHED)],
      [assign(ASSIGN), assign(ASSIGN_UNPUBLISHED)],
      [],
      new Set()
    );

    const badged = Array.from(document.querySelectorAll('[data-dotbugi-status]')).map((b) =>
      b.closest('a')?.getAttribute('href')
    );
    expect(badged).toEqual([PUBLISHED, ASSIGN]);
  });
});

describe('injectBadgesIntoDOM 상태 판정', () => {
  const LMS = 'https://learn.hansung.ac.kr/mod';
  const url = (mod: string, id: number) => `${LMS}/${mod}/view.php?id=${id}`;
  const page = (items: [string, number][]) =>
    `<ul>${items
      .map(
        ([mod, id]) =>
          `<li class="activity modtype_${mod}"><div class="activityinstance"><a href="${url(mod, id)}"><span class="instancename">${mod}${id}</span></a></div></li>`
      )
      .join('')}</ul>`;
  const badgeOf = (mod: string, id: number) =>
    document.querySelector(`a[href="${url(mod, id)}"] [data-dotbugi-status]`) as HTMLElement | null;

  // 지금: 2026-03-15 12:00
  const RANGE_2DAYS = '2026-03-01 00:00:00 ~ 2026-03-17 23:59:00';
  const RANGE_3HOURS = '2026-03-01 00:00:00 ~ 2026-03-15 15:00:00';
  const RANGE_ENDED = '2026-03-01 00:00:00 ~ 2026-03-10 23:59:00';
  const vod = (id: number, over: Partial<Vod> = {}) =>
    ({ url: url('vod', id), isAttendance: 'X', range: RANGE_2DAYS, ...over }) as Vod;
  const assign = (id: number, over: Partial<Assign> = {}) =>
    ({ url: url('assign', id), isSubmit: false, dueDate: '2026-03-17 23:59', ...over }) as Assign;
  const quiz = (id: number, over: Partial<Quiz> = {}) =>
    ({ url: url('quiz', id), isSubmit: false, dueDate: null, ...over }) as Quiz;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('VOD: 출석·결석·대기·임박을 구분한다', () => {
    document.body.innerHTML = page([
      ['vod', 1],
      ['vod', 2],
      ['vod', 3],
      ['vod', 4],
    ]);
    injectBadgesIntoDOM(
      [vod(1, { isAttendance: 'O' }), vod(2, { range: RANGE_ENDED }), vod(3), vod(4, { range: RANGE_3HOURS })],
      [],
      [],
      new Set()
    );

    expect(badgeOf('vod', 1)!.textContent).toBe('courseStatus.vod.completed');
    expect(badgeOf('vod', 2)!.textContent).toBe('courseStatus.vod.absent');
    expect(badgeOf('vod', 3)!.textContent).toBe('courseStatus.vod.pending · date.daysLater');
    expect(badgeOf('vod', 4)!.textContent).toBe('courseStatus.vod.pending · date.hoursLater');
    // 임박은 붉은 계열
    expect(badgeOf('vod', 4)!.style.color).toBe('rgb(185, 28, 28)');
  });

  it('VOD: 시청 시간이 있으면 수강중으로 보고 진행률만큼 배경을 채운다', () => {
    document.body.innerHTML = page([
      ['vod', 1],
      ['vod', 2],
    ]);
    injectBadgesIntoDOM(
      [
        vod(1, { watchedTime: '05:00', requiredTime: '00:10:00' }),
        vod(2, { watchedTime: '30:00', requiredTime: '10:00', range: RANGE_3HOURS }),
      ],
      [],
      [],
      new Set()
    );

    const inProgress = badgeOf('vod', 1)!;
    expect(inProgress.textContent).toBe('courseStatus.vod.inProgress · date.daysLater');
    expect(inProgress.style.background).toContain('50%');
    // 진행률은 100% 를 넘지 않고, 마감 임박이면 붉은 채움색
    const urgent = badgeOf('vod', 2)!;
    expect(urgent.style.background).toContain('100%');
    expect(urgent.style.color).toBe('rgb(185, 28, 28)');
  });

  it('과제·퀴즈: 제출·마감 지남·남은 기간·마감 없음을 구분한다', () => {
    document.body.innerHTML = page([
      ['assign', 1],
      ['assign', 2],
      ['assign', 3],
      ['quiz', 1],
      ['quiz', 2],
    ]);
    injectBadgesIntoDOM(
      [],
      [assign(1, { isSubmit: true }), assign(2, { dueDate: '2026-03-14 23:59' }), assign(3)],
      [quiz(1), quiz(2, { dueDate: '2026-03-15 12:30' })],
      new Set()
    );

    expect(badgeOf('assign', 1)!.textContent).toBe('courseStatus.assign.completed');
    expect(badgeOf('assign', 2)!.textContent).toBe('courseStatus.assign.absent');
    expect(badgeOf('assign', 3)!.textContent).toBe('courseStatus.assign.pending · date.daysLater');
    expect(badgeOf('quiz', 1)!.textContent).toBe('courseStatus.quiz.pending');
    expect(badgeOf('quiz', 2)!.textContent).toBe('courseStatus.quiz.pending · date.minutesLater');
  });

  it('숨긴 항목은 숨김 배지를 달고, 다시 주입하면 이전 배지를 지운다', () => {
    document.body.innerHTML = page([
      ['vod', 1],
      ['assign', 1],
    ]);
    const hidden = new Set([url('vod', 1)]);
    injectBadgesIntoDOM([vod(1)], [assign(1)], [], hidden);
    injectBadgesIntoDOM([vod(1)], [assign(1)], [], hidden);

    expect(document.querySelectorAll('[data-dotbugi-status]')).toHaveLength(2);
    expect(badgeOf('vod', 1)!.textContent).toBe('courseStatus.hidden');
  });

  it('데이터에 없는 활동에는 배지를 달지 않는다', () => {
    document.body.innerHTML = page([['vod', 9]]);
    injectBadgesIntoDOM([vod(1)], [], [], new Set());
    expect(badgeOf('vod', 9)).toBeNull();
  });
});
