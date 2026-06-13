---
description: 사용자가 "이슈 목록", "할 일 확인", "issues" 등을 요청하거나, 작업 시작 전 현재 이슈 상태를 파악해야 할 때 사용
---

GitHub Issues 목록을 조회하는 스킬. (저장소: `hs-shell/dotbugi`)

## 1단계: 이슈 조회

```
gh issue list --repo hs-shell/dotbugi --state open \
  --json number,title,labels,assignees --limit 100
```

- 프로젝트 보드를 쓰는 경우 Status도 함께 보고 싶으면 `gh project item-list <번호> --owner hs-shell --format json`을 시도하고, 보드가 없거나 `read:project` 스코프가 없어 실패하면 건너뛴다(이슈 목록만 출력).

## 2단계: 출력

번호 · 제목 · 라벨 · 담당자를 테이블로 출력한다.

- 기본은 열린(open) 이슈만. 사용자가 요청하면 `--state all`로 전체 표시.
- 트래커 이슈(sub-issue를 가진)는 진행 배지(`n/m`)가 있으면 함께 표시.
