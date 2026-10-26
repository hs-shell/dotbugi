import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCoursesFromDOM } from '@dotbugi/lms-parser';

import { useGetCourses } from '@/hooks/useGetCourses';
import type { CourseBase } from '@/types';
import { renderHook, stubChromeStorage } from './renderHook';

vi.mock('@dotbugi/lms-parser', () => ({ parseCoursesFromDOM: vi.fn() }));

const store: Record<string, unknown> = {};
let emitChange: ReturnType<typeof stubChromeStorage>['emitChange'];

const COURSES: CourseBase[] = [
  { courseId: '1', courseTitle: 'A', prof: '' },
  { courseId: '2', courseTitle: 'B', prof: '' },
  { courseId: '9', courseTitle: 'C', prof: '', isCommunity: true },
];

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  const stub = stubChromeStorage(store);
  emitChange = stub.emitChange;
  vi.stubGlobal('chrome', stub.chromeStub);
  vi.mocked(parseCoursesFromDOM).mockReturnValue(COURSES);
});

const ids = (courses: CourseBase[]) => courses.map((c) => c.courseId);

describe('useGetCourses', () => {
  it('처음 쓰면 커뮤니티를 뺀 과목을 추적하고 초기화 콜백에 넘긴다', async () => {
    const onInitialized = vi.fn();
    const { result } = await renderHook(useGetCourses, onInitialized);

    expect(result.current.isInitialized).toBe(true);
    expect(ids(result.current.trackedCourses)).toEqual(['1', '2']);
    expect(store.trackedCourseIds).toEqual(['1', '2']);
    expect(store.knownCourseIds).toEqual(['1', '2', '9']);
    expect(JSON.parse(store.courses as string)).toEqual(COURSES);
    expect(ids(onInitialized.mock.calls[0][0])).toEqual(['1', '2']);
    expect(onInitialized.mock.calls[0][1]).toEqual(COURSES);
  });

  it('사라진 과목은 추적에서 빼고 처음 보는 과목만 추가하며, 사용자가 끈 과목은 그대로 둔다', async () => {
    store.trackedCourseIds = ['1', 'gone'];
    store.knownCourseIds = ['1', '2', '9', 'gone'];
    vi.mocked(parseCoursesFromDOM).mockReturnValue([...COURSES, { courseId: '3', courseTitle: 'D', prof: '' }]);

    const { result } = await renderHook(useGetCourses, undefined);
    expect(result.current.trackedCourseIds).toEqual(['1', '3']);
    expect(store.trackedCourseIds).toEqual(['1', '3']);
  });

  it('추적 목록이 바뀌지 않았으면 다시 저장하지 않는다', async () => {
    store.trackedCourseIds = ['1'];
    store.knownCourseIds = ['1', '2', '9'];
    const set = vi.spyOn(chrome.storage.local, 'set');
    await renderHook(useGetCourses, undefined);
    expect(set.mock.calls.some(([items]) => 'trackedCourseIds' in items)).toBe(false);
  });

  it('과목도 저장된 추적 목록도 없으면 초기화하지 않는다', async () => {
    vi.mocked(parseCoursesFromDOM).mockReturnValue([]);
    const { result } = await renderHook(useGetCourses, undefined);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.trackedCourseIds).toEqual([]);
  });

  it('setTrackedCourseIds 와 다른 곳(DOM 토글)의 저장소 변경이 상태에 반영된다', async () => {
    const { result } = await renderHook(useGetCourses, undefined);

    await act(async () => result.current.setTrackedCourseIds(['2']));
    expect(ids(result.current.trackedCourses)).toEqual(['2']);
    expect(store.trackedCourseIds).toEqual(['2']);

    await emitChange({ trackedCourseIds: { newValue: ['1', '9'] } });
    expect(ids(result.current.trackedCourses)).toEqual(['1', '9']);

    await emitChange({ trackedCourseIds: { newValue: undefined } });
    expect(ids(result.current.trackedCourses)).toEqual(['1', '9']);
  });
});
