import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCoursesFromDOM } from '@dotbugi/lms-parser';

import { injectCourseToggles } from '@/lib/injectCourseToggles';

vi.mock('@dotbugi/lms-parser', () => ({ parseCoursesFromDOM: vi.fn() }));

const store: Record<string, unknown> = {};

const courses = [
  { courseId: '1', courseTitle: 'A', prof: '' },
  { courseId: '2', courseTitle: 'B', prof: '' },
  { courseId: '9', courseTitle: '커뮤니티', prof: '', isCommunity: true },
];

function renderList(ids: string[]) {
  document.body.innerHTML = `<ul class="my-course-lists">${ids
    .map(
      (id) =>
        `<li><a class="course_link" href="https://learn.hansung.ac.kr/course/view.php?id=${id}"></a><div class="course_box"></div></li>`
    )
    .join('')}</ul>`;
}

const toggleOf = (id: string) => document.querySelector(`[data-dotbugi-toggle="${id}"]`) as HTMLElement | null;

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.mocked(parseCoursesFromDOM).mockReturnValue(courses);
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        set: vi.fn((items: Record<string, unknown>) => Object.assign(store, items)),
        get: vi.fn((keys: string[], cb: (r: Record<string, unknown>) => void) =>
          cb(Object.fromEntries(keys.filter((k) => k in store).map((k) => [k, store[k]])))
        ),
      },
    },
  });
});

describe('injectCourseToggles', () => {
  it('처음 쓰면 커뮤니티를 뺀 모든 강좌를 추적하고, 강좌마다 토글을 붙인다', () => {
    renderList(['1', '2', '9']);
    injectCourseToggles();

    expect(store.trackedCourseIds).toEqual(['1', '2']);
    expect(store.communityIds).toEqual(['9']);
    expect(store.knownCourseIds).toEqual(['1', '2', '9']);
    expect(toggleOf('1')!.title).toBe('Tracking');
    expect(toggleOf('9')!.title).toBe('Not tracking');
  });

  it('목록에서 사라진 강좌는 추적에서 빼고, 처음 보는 강좌는 추적에 더한다', () => {
    store.trackedCourseIds = ['1', 'gone'];
    store.knownCourseIds = ['1', '2', 'gone'];
    vi.mocked(parseCoursesFromDOM).mockReturnValue([...courses, { courseId: '3', courseTitle: 'C', prof: '' }]);
    renderList(['1', '2', '3']);
    injectCourseToggles();

    expect(store.trackedCourseIds).toEqual(['1', '3']);
    // 이미 알던 강좌(2)는 사용자가 끈 것으로 보고 다시 켜지 않는다
    expect(toggleOf('2')!.title).toBe('Not tracking');
  });

  it('토글을 누르면 추적 여부가 바뀌어 저장되고 표시도 바뀐다', () => {
    renderList(['1']);
    injectCourseToggles();

    toggleOf('1')!.click();
    expect(store.trackedCourseIds).toEqual(['2']);
    expect(toggleOf('1')!.title).toBe('Not tracking');

    toggleOf('1')!.click();
    expect(store.trackedCourseIds).toEqual(['2', '1']);
    expect(toggleOf('1')!.title).toBe('Tracking');
  });

  it('다시 불러도 토글을 중복으로 붙이지 않는다', () => {
    renderList(['1']);
    injectCourseToggles();
    injectCourseToggles();
    expect(document.querySelectorAll('[data-dotbugi-toggle]')).toHaveLength(1);
  });

  it('강좌를 하나도 못 찾으면 아무것도 저장하지 않는다', () => {
    vi.mocked(parseCoursesFromDOM).mockReturnValue([]);
    injectCourseToggles();
    expect(store).toEqual({});
  });
});
