---
description: 사용자가 "이슈 구현해줘", "이거 작업하자", "#3 시작", "implement N" 등을 요청하거나, 이슈를 골라 구현을 시작해야 할 때 사용
---

GitHub Issue 를 구현한다. (저장소: `hs-shell/dotbugi`) 구현은 **ponytail** 원칙(필요한 만큼만, 있는 것 재사용, 테스트로 확인)을 따른다.

## 1단계: 이슈 선택

- `$ARGUMENTS` 에 번호가 있으면 그 이슈, 없으면 `/issues` 로 목록을 보여 주고 고르게 한다. 이슈가 없는 작업이면 `/create-issue` 로 먼저 만든다.

```
gh issue view <번호> --repo hs-shell/dotbugi --json number,title,body,labels,assignees
```

- 내용이 불명확하거나 범위 판단이 필요하면 `/analyze-issue <번호>` 로 분석하고 합의한 뒤 시작한다.

## 2단계: 브랜치

```
git fetch origin main
git checkout -b <type>/<번호>-<짧은-설명> origin/main
```

## 3단계: 설계 (짧게)

- 루트 `CLAUDE.md` 의 아키텍처를 보고, 바꿀 곳과 호출부·테스트·문서(`docs/`)를 모두 찾는다.
- 이미 있는 유틸·훅·컴포넌트(`src/lib`, `src/hooks`, `src/components/ui`)를 먼저 찾는다. 새 의존성은 넣지 않는다.
- manifest 권한을 늘려야 하면 먼저 사용자와 상의한다.

## 4단계: 테스트 먼저

- 버그: `/repro-test` 로 재현하는 실패 테스트를 먼저 쓴다.
- 기능: 완료 기준을 테스트로 옮긴 뒤 구현한다 (`/write-test`).

## 5단계: 구현

1. 작은 단위로 작성하고, 단계마다 사용자와 확인한다.
2. `.claude/rules/` 의 컨벤션을 따른다.

## 6단계: 검증 (CI 와 같은 조건)

```
npx prettier --check . && npm run lint && npm run build && npm run test:coverage
```

바꾼 파일의 커버리지가 떨어지지 않았는지 보고, `/ponytail-review` 로 변경을 훑는다.

## 7단계: 완료

`/create-pr` 로 PR 을 연다.
