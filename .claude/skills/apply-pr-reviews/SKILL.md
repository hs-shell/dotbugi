---
description: 사용자가 "PR 리뷰 반영", "리뷰 대기", "리뷰 올라오면 반영해줘", "리뷰 코멘트 처리" 등을 요청하거나, 올린 PR에 달린 리뷰(사람/봇 코멘트)를 검증해 코드에 반영해야 할 때 사용
---

올린 PR에 달린 리뷰를 **타당성을 검증해 코드에 반영**하는 스킬. (저장소: `hs-shell/dotbugi`)

대상: 리뷰어 review body, 인라인 코멘트(reviewThreads), 일반 PR 코멘트, 리뷰 봇(CodeRabbit 등) 코멘트.

## 1단계: PR 식별

- `$ARGUMENTS`에 PR 번호가 있으면 사용, 없으면 현재 브랜치의 PR을 찾는다.

```
gh pr view <번호 또는 생략> --json number,url,headRefName,reviewDecision,state
```

- PR이 없으면 `/create-pr`로 먼저 만들도록 안내하고 중단.

## 2단계: 리뷰 수집 (미해결만)

```
gh pr view <번호> --json reviews,comments
gh api repos/hs-shell/dotbugi/pulls/<번호>/comments       # 인라인 코멘트(파일·라인)
gh api graphql ...reviewThreads(isResolved)               # 스레드 해결 여부
```

- 이미 resolved/직전에 반영한 코멘트는 제외.

## 3단계: 대기 (리뷰가 아직 없을 때만)

새 리뷰가 없으면 폴링으로 대기한다. PR 리뷰는 외부(깃헙) 이벤트라 harness가 완료 통지를 못 줘 폴링이 유일한 경로다(일반 배경 작업은 폴링 금지지만 이 경우 예외).

- `/loop`로 주기 재확인: 예) `/loop 5m /apply-pr-reviews <PR번호>`
- 리뷰가 잡히면 즉시 4단계, loop 종료. "지금 있는 것만" 요청이면 대기 없이 진행.

## 4단계: 타당성 검증 → 반영

- **타당함** → 코드 수정. 변경 코드에 해당하는 `.claude/rules/` 준수.
- **타당하지 않음/오해/스코프 밖** → 반영 보류, 근거 기록.
- **불확실/트레이드오프 큼** → 보류하고 사용자 판단 항목으로.

추측 금지 — 실제 코드·동작(확장 로드)으로 확인해 판단한다. CodeRabbit이라도 항상 옳지는 않다.

## 5단계: 검증·커밋

- CI 동일 조건 검증: `npx prettier --check .` / `npm run lint` / `npm run build` / `npm run test`.
- 반영분을 커밋해 PR 브랜치에 push (Conventional Commits).
- 인라인 코멘트엔 한 줄 답글 후 스레드 resolve, 보류 항목엔 보류 사유 답글.

## 6단계: 보고

항목별 한 줄: **반영 / 보류(사유) / 거부(사유)**. 보류·거부는 사용자 결정을 받는다.

## 주의

- 한 번에 여러 코멘트가 같은 파일을 건드리면 충돌 없게 묶어서 수정한다.
