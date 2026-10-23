import { describe, it, expect } from 'vitest';
import { diffTrackedCourseIds } from '@/lib/diffTrackedCourseIds';

describe('diffTrackedCourseIds', () => {
  it('새로 추적한 과목은 added 로 구한다', () => {
    expect(diffTrackedCourseIds(['1'], ['1', '2'])).toEqual({ added: ['2'], removed: [] });
  });

  it('추적 해제한 과목은 removed 로 구한다', () => {
    expect(diffTrackedCourseIds(['1', '2'], ['2'])).toEqual({ added: [], removed: ['1'] });
  });

  it('추가와 해제가 동시에 일어나도 각각 구한다', () => {
    expect(diffTrackedCourseIds(['1', '2'], ['2', '3'])).toEqual({ added: ['3'], removed: ['1'] });
  });

  it('변화가 없거나 순서만 바뀌면 빈 결과', () => {
    expect(diffTrackedCourseIds(['1', '2'], ['2', '1'])).toEqual({ added: [], removed: [] });
  });
});
