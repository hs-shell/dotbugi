---
description: 사용자가 "이슈 구현해줘", "이거 작업하자", "#3 시작", "implement N" 등을 요청하거나, 이슈를 골라 구현을 시작해야 할 때 사용
---

GitHub Issue를 구현하는 스킬. (저장소: `hs-shell/dotbugi`)

## 1단계: 이슈 선택

- `$ARGUMENTS`에 번호가 있으면 그 이슈, 없으면 `/issues`로 열린 이슈 목록을 보여주고 선택받는다.

```
gh issue view <번호> --repo hs-shell/dotbugi --json number,title,body,labels,assignees
```

- 이슈 내용이 불명확하거나 유효성·범위 판단이 필요하면 먼저 `/analyze-issue <번호>`로 분석하고 합의한 뒤 시작한다.

## 2단계: 브랜치 생성

stale한 로컬 main에서 분기하지 않도록 먼저 fetch하고 `origin/main` 기준으로 분기한다.

```
git fetch origin main
git checkout -b <type>/<short-description> origin/main
```

- 브랜치명: `feat/...`, `fix/...` 등 (이슈 번호를 넣어도 됨: `fix/123-vod-parse`).

## 3단계: 구현

1. 코드베이스를 파악한 뒤(루트 `CLAUDE.md`의 아키텍처 참고), 작은 단위로 작성한다.
2. 각 단계마다 사용자와 확인하며 진행한다.
3. 변경 코드는 `.claude/rules/`의 컨벤션을 따른다.

## 4단계: 사전 검증 (CI 동일 조건)

PR 전에 통과시킨다:

```
npm run lint
npm run build   # tsc -b + vite build (타입 체크 포함)
npm run test
```

## 5단계: 완료

`/create-pr` 스킬로 PR을 생성한다. (PR 제목은 Conventional Commits — 스쿼시 머지 + release-please가 읽음)
