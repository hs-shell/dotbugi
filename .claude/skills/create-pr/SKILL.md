---
description: 사용자가 "PR 만들어", "PR 생성", "push and create PR" 등을 요청하거나, 구현 완료 후 PR 생성이 필요할 때 사용
---

현재 브랜치에서 GitHub Pull Request를 생성하는 스킬. (저장소: `hs-shell/dotbugi`)

## 0단계: 리팩토링

`/refactor` 스킬을 실행해 변경 코드가 프로젝트 rules에 부합하는지 검사·수정한다. 수정이 생기면 커밋에 포함되도록 staging한다.

## 1단계: 현재 상태 파악

아래를 병렬 실행한다:

- `git status`
- `git log main..HEAD --oneline`
- `git diff main...HEAD`

## 2단계: PR 제목 결정 (★ 중요: 스쿼시 머지 + release-please)

이 저장소는 **스쿼시 머지**만 허용하고, 스쿼시 커밋 제목 = **PR 제목**이 main 히스토리에 남는다. release-please가 그 제목을 읽어 버전을 산출하므로 **PR 제목은 반드시 Conventional Commits**여야 한다.

- 형식: `<type>: <description>` (필요시 `<type>(<scope>): ...`)
- type: `feat` / `fix` / `docs` / `refactor` / `perf` / `test` / `chore` / `ci` / `style`
- 영어, 명령형, 70자 이내 권장
- 예: `feat: 과제 마감 D-day 알림 추가`
- `feat`→minor, `fix`→patch, `feat!:`/`BREAKING CHANGE`→major 로 버전이 정해진다.

## 3단계: remote push

remote tracking branch가 없으면 먼저 push한다:

```
git push -u origin HEAD
```

## 4단계: 본문 작성 + 라벨

- 본문은 `.github/PULL_REQUEST_TEMPLATE.md`의 모든 섹션을 diff 기반으로 채운다. **관련 이슈를 `Closes #<번호>`로 반드시 참조**한다(없으면 `pr-checks`의 이슈 가드가 실패).
- 라벨: 브랜치/본문에서 이슈 번호를 찾으면 `gh issue view <번호> --json labels`로 이슈 라벨을 상속한다.
- 타입 라벨(`✨ feat`/`🐛 bug` 등)은 **`pr-autolabel` 워크플로가 PR 제목 prefix로 자동 부착**하므로 수동 지정 불필요.

## 5단계: PR 생성

```
gh pr create --repo hs-shell/dotbugi --base main \
  --title "<conventional 제목>" \
  --body "<채운 본문>" \
  --assignee @me \
  --label "<상속한 이슈 라벨들>"
```

## 6단계: 결과 출력

생성된 PR URL을 출력한다. (병합은 스쿼시 머지로 진행됨을 안내)
