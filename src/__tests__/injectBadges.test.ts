import { describe, expect, it, vi } from 'vitest';

import { injectBadgesIntoDOM } from '@/lib/courseStatus/badge';
import type { Vod } from '@/types';

vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }));

const PUBLISHED = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=101';
const UNPUBLISHED = 'https://learn.hansung.ac.kr/mod/vod/view.php?id=1220559';

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
</ul>`;

describe('injectBadgesIntoDOM', () => {
  it('아직 공개 전 VOD 에는 시청 배지를 붙이지 않는다', () => {
    document.body.innerHTML = COURSE_PAGE;
    const vod = (url: string) =>
      ({ url, isAttendance: 'X', range: '2024-12-01 00:00:00 ~ 2028-12-30 23:59:00' }) as unknown as Vod;

    injectBadgesIntoDOM([vod(PUBLISHED), vod(UNPUBLISHED)], [], [], new Set());

    const badged = Array.from(document.querySelectorAll('[data-dotbugi-status]')).map((b) =>
      b.closest('a')?.getAttribute('href')
    );
    expect(badged).toEqual([PUBLISHED]);
  });
});
