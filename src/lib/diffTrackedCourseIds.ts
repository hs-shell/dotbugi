/** 추적 과목 ID 목록의 이전·현재 값을 비교해 새로 추가된 ID와 제거된 ID를 구한다. */
export function diffTrackedCourseIds(prevIds: string[], nextIds: string[]): { added: string[]; removed: string[] } {
  const prevSet = new Set(prevIds);
  const nextSet = new Set(nextIds);
  return {
    added: nextIds.filter((id) => !prevSet.has(id)),
    removed: prevIds.filter((id) => !nextSet.has(id)),
  };
}
