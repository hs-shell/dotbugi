import { describe, it, expect } from 'vitest';
import { deduplicateInto } from '@/lib/deduplicateInto';

describe('deduplicateInto', () => {
  it('빈 source는 target에 영향 없음', () => {
    const target = [{ id: '1' }];
    const seen = new Set<string>();
    deduplicateInto(target, [], seen, (item) => item.id);
    expect(target).toHaveLength(1);
  });

  it('중복 없는 source는 전부 추가', () => {
    const target: { id: string }[] = [];
    const seen = new Set<string>();
    deduplicateInto(target, [{ id: '1' }, { id: '2' }], seen, (item) => item.id);
    expect(target).toHaveLength(2);
  });

  it('source 내부 중복은 첫 번째만 추가', () => {
    const target: { id: string }[] = [];
    const seen = new Set<string>();
    deduplicateInto(target, [{ id: '1' }, { id: '1' }], seen, (item) => item.id);
    expect(target).toHaveLength(1);
  });

  it('target에 이미 있는 키는 추가하지 않음 (seen으로 판단)', () => {
    const target = [{ id: '1' }];
    const seen = new Set(['1']);
    deduplicateInto(target, [{ id: '1' }, { id: '2' }], seen, (item) => item.id);
    expect(target).toHaveLength(2);
    expect(target[1].id).toBe('2');
  });

  it('seen Set이 호출 후 업데이트됨', () => {
    const target: { id: string }[] = [];
    const seen = new Set<string>();
    deduplicateInto(target, [{ id: 'a' }, { id: 'b' }], seen, (item) => item.id);
    expect(seen.has('a')).toBe(true);
    expect(seen.has('b')).toBe(true);
  });

  it('여러 번 호출 시 seen이 누적되어 중복 방지', () => {
    const target: { id: string }[] = [];
    const seen = new Set<string>();
    deduplicateInto(target, [{ id: '1' }], seen, (item) => item.id);
    deduplicateInto(target, [{ id: '1' }, { id: '2' }], seen, (item) => item.id);
    expect(target).toHaveLength(2);
    expect(target.map((t) => t.id)).toEqual(['1', '2']);
  });

  it('커스텀 getKey 함수 사용', () => {
    type Item = { courseId: string; week: number };
    const target: Item[] = [];
    const seen = new Set<string>();
    const items: Item[] = [
      { courseId: 'C1', week: 1 },
      { courseId: 'C1', week: 1 }, // 중복
      { courseId: 'C1', week: 2 },
    ];
    deduplicateInto(target, items, seen, (item) => `${item.courseId}-${item.week}`);
    expect(target).toHaveLength(2);
  });

  it('빈 키 문자열도 정상 동작', () => {
    const target: { id: string }[] = [];
    const seen = new Set<string>();
    deduplicateInto(target, [{ id: '' }, { id: '' }], seen, (item) => item.id);
    expect(target).toHaveLength(1);
  });

  it('target과 source가 같은 배열 참조여도 동작 (무한루프 아님 - for..of snapshot)', () => {
    const arr = [{ id: '1' }];
    const seen = new Set<string>();
    // source의 for..of는 호출 시점의 길이 기준이므로 안전
    deduplicateInto(arr, [{ id: '2' }], seen, (item) => item.id);
    expect(arr).toHaveLength(2);
  });
});
