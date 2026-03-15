/**
 * 키 생성 함수 기반으로 중복 제거하면서 배열에 추가
 */
export function deduplicateInto<T>(
  target: T[],
  source: T[],
  seen: Set<string>,
  getKey: (item: T) => string,
): void {
  for (const item of source) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      target.push(item);
    }
  }
}
