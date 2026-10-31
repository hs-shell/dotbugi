---
description: 사용자가 "PR 만들어", "PR 생성", "push and create PR" 등을 요청하거나, 구현 완료 후 PR 생성이 필요할 때 사용
---

현재 브랜치로 Pull Request 를 만든다. (저장소: `hs-shell/dotbugi`)

## 0단계: 리팩토링

`/refactor` 스킬로 변경 코드가 `.claude/rules/` 에 맞는지 검사·수정한다. 수정이 생기면 커밋에 포함한다.

## 1단계: 상태 파악

병렬로 실행한다:

- `git status`
- `git log origin/main..HEAD --oneline`
- `git diff origin/main...HEAD --stat`

main 브랜치라면 멈추고 `<type>/<설명>` 브랜치를 먼저 만든다.

## 2단계: PR 전 검사 (CI 와 같은 조건)

```
npx prettier --check . && npm run lint && npm run build && npm run test:coverage
```

- 실패하면 고치고 다시 돌린다.
- **테스트 필수**: `src/` 를 바꿨는데 `*.test.ts(x)` 변경이 없으면 `테스트 필수` 검사가 실패한다. `/write-test`(버그는 `/repro-test`)로 먼저 테스트를 쓴다. 정말 필요 없는 변경이면 본문에 이유를 적고 메인테이너에게 `no-test` 라벨을 요청한다.
- `/ponytail-review` 로 변경을 훑고 필요 없는 코드는 지운다.

## 3단계: PR 제목

스쿼시 머지만 쓰므로 **PR 제목 = main 커밋 제목**이고 release-please 가 이걸로 버전을 정한다.

- `<type>: <설명>` (Conventional Commits). type 은 `.github/workflows/pr-title.yml` 목록: `feat`/`fix`/`docs`/`refactor`/`perf`/`test`/`chore`/`ci`/`style`/`build`/`revert`
- 예: `feat: 과제 마감 D-day 알림 추가`. `feat` → minor, `fix` → patch, `feat!:`/`BREAKING CHANGE` → major.
- 타입 라벨은 `pr-autolabel` 이 붙인다.

## 4단계: 본문

`.github/PULL_REQUEST_TEMPLATE.md` 는 주석으로 된 안내다. 주석 속 질문에 답하는 본문을 쓴다 (한국어 가능, 주석은 지워도 된다).

- 무엇을 해결하는지, 검토한 다른 방법, 리뷰어가 볼 부분, 추가·수정한 테스트. UI 변경이면 전후 스크린샷.
- **`Closes #<번호>` 필수**. `issue-link` 검사는 주석 밖의 본문만 본다. 이슈가 없으면 `/create-issue` 로 먼저 만든다.
- 브랜치·본문에서 이슈 번호를 찾으면 `gh issue view <번호> --json labels` 로 이슈 라벨을 상속한다.
- 끝에 시스템이 지정한 attribution 줄이 있으면 붙인다.

## 5단계: push + 생성

```
git push -u origin HEAD
gh pr create --repo hs-shell/dotbugi --base main --title "<제목>" --body-file <본문 파일> --assignee @me --label "<상속한 라벨>"
```

## 6단계: 결과

PR URL 을 알려 준다. CodeRabbit 리뷰와 커버리지 댓글이 자동으로 달리고, `verify`·`issue-link`·`CodeRabbit`·`test-required` 통과 + 승인 1 이면 스쿼시 머지할 수 있다고 안내한다.
