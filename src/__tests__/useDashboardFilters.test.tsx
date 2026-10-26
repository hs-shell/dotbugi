import { act } from 'react';
import { describe, expect, it } from 'vitest';

import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { Assign, Quiz, TAB_TYPE, Vod } from '@/types';
import { renderHook } from './renderHook';

const base = { prof: '교수', courseId: '1' };
const vods = [
  { ...base, courseTitle: '자료구조', title: '1강', isAttendance: 'O', range: null },
  { ...base, courseTitle: '운영체제', title: '2강', isAttendance: 'X', range: null },
] as unknown as Vod[];
const assigns = [
  { ...base, courseTitle: '자료구조', title: '과제1', isSubmit: true, dueDate: null },
  { ...base, courseTitle: '자료구조', title: '과제2', isSubmit: false, dueDate: null },
] as unknown as Assign[];
const quizzes = [
  { ...base, courseTitle: '네트워크', title: '퀴즈', isSubmit: false, dueDate: null },
] as unknown as Quiz[];

const props = (activeTab: TAB_TYPE) => ({ vods, assigns, quizzes, activeTab });

describe('useDashboardFilters', () => {
  it('탭별로 중복 없는 과목명 목록을 만든다', async () => {
    const { result } = await renderHook(useDashboardFilters, props(TAB_TYPE.VIDEO));
    expect(result.current.courseTitlesMap).toEqual({
      VIDEO: ['자료구조', '운영체제'],
      ASSIGN: ['자료구조'],
      QUIZ: ['네트워크'],
      SETTING: [],
    });
  });

  it('과목 필터는 누를 때마다 켜고 끄며, 현재 탭에만 적용된다', async () => {
    const { result } = await renderHook(useDashboardFilters, props(TAB_TYPE.VIDEO));

    await act(async () => result.current.handleCourseTitleChange('운영체제'));
    expect(result.current.filteredVods.map((v) => v.title)).toEqual(['2강']);
    expect(result.current.filters.ASSIGN.courseTitles).toEqual([]);

    await act(async () => result.current.handleCourseTitleChange('운영체제'));
    expect(result.current.filteredVods).toHaveLength(2);
  });

  it('제출 여부 필터와 필터 초기화', async () => {
    const { result } = await renderHook(useDashboardFilters, props(TAB_TYPE.ASSIGN));

    await act(async () => result.current.handleSubmitFilterChange(false));
    expect(result.current.filteredAssigns.map((a) => a.title)).toEqual(['과제2']);

    await act(async () => result.current.clearFilters());
    expect(result.current.filters.ASSIGN).toEqual({ courseTitles: [], submitStatuses: [] });
    expect(result.current.filteredAssigns).toHaveLength(2);
  });

  it('출석 상태 필터로 VOD 를 거른다', async () => {
    const { result } = await renderHook(useDashboardFilters, props(TAB_TYPE.VIDEO));
    await act(async () => result.current.handleAttendanceFilterChange('attendance.absent'));
    expect(result.current.filteredVods.map((v) => v.title)).toEqual(['2강']);
  });

  it('검색어로 거르고, 탭을 바꾸면 검색어와 필터 패널을 초기화한다', async () => {
    const { result, rerender } = await renderHook(useDashboardFilters, props(TAB_TYPE.QUIZ));

    await act(async () => {
      result.current.setSearchTerm('없는과목');
      result.current.setIsFilterOpen(true);
    });
    expect(result.current.filteredQuizzes).toEqual([]);

    await rerender(props(TAB_TYPE.VIDEO));
    expect(result.current.searchTerm).toBe('');
    expect(result.current.isFilterOpen).toBe(false);
  });
});
