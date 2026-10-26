---
description: 사용자가 "리베이스", "rebase", "main 따라잡기", "main 최신으로 올려", "충돌 해결" 등을 요청하거나, PR 브랜치가 main 보다 뒤처져 충돌이 났을 때 사용
---

현재 브랜치를 최신 `origin/main` 위로 리베이스해 내 커밋을 그 위에 다시 쌓고, 충돌이 나면 해결까지 한다. (저장소: `hs-shell/dotbugi`)

## 0단계: 확인

```
git status
git branch --show-current
```

- **`main` 이면 멈춘다.** 리베이스는 작업 브랜치에서만 한다.
- 커밋하지 않은 변경이 있으면 사용자에게 묻고 **WIP 커밋**으로 남긴다 (`git commit -m "wip"`). `git stash` 는 쓰지 않는다 — stash 는 모든 worktree 가 함께 쓰므로 다른 작업을 꺼낼 수 있다.
- 되돌릴 지점을 기억해 둔다: `git rev-parse HEAD` (문제가 생기면 `git reset --hard <그 SHA>`).

## 1단계: 리베이스

```
git fetch origin main
git log --oneline origin/main..HEAD     # 다시 쌓일 내 커밋
git rebase origin/main
```

충돌 없이 끝나면 3단계로.

## 2단계: 충돌 해결

`git status` 로 충돌 파일을 보고, 파일마다 **양쪽 의도를 모두 살려** 합친다. 한쪽을 통째로 고르지 않는다.

1. 상황 파악
   - main 쪽 변경: `git log --oneline ORIG_HEAD..origin/main -- <파일>` 과 `git diff <merge-base> origin/main -- <파일>` 로 main 에서 왜 바뀌었는지 본다 (커밋 메시지·PR 번호).
   - 내 쪽 변경: 지금 적용 중인 커밋 `git show REBASE_HEAD -- <파일>`.
2. 파일 종류별
   - **코드·문서**: 충돌 표식(`<<<<<<<`, `=======`, `>>>>>>>`)을 지우고 두 변경을 모두 반영한다. main 에서 함수 이름·시그니처가 바뀌었으면 내 코드도 그에 맞춘다.
   - **`package-lock.json`**: 손으로 고치지 않는다. `package.json` 충돌을 먼저 풀고 `git checkout --theirs package-lock.json && npm install` 로 다시 만든다. (리베이스 중에는 `--ours` = main, `--theirs` = 내 커밋)
   - **`CHANGELOG.md`, `.release-please-manifest.json`, manifest 의 version**: release-please 가 관리하므로 **main 쪽(`--ours`)** 을 그대로 쓴다.
   - **`manifest.config.ts` 권한**: 양쪽 권한을 합치되, 내가 늘린 권한이 여전히 필요한지 확인한다.
   - **i18n 문구(`src/i18n/locales`)**: 양쪽 키를 모두 남기고 언어별 파일이 같은 키를 갖는지 확인한다.
   - **삭제 vs 수정**: main 에서 지운 파일을 내가 고쳤다면, 왜 지웠는지 확인하고 내 변경을 옮겨 갈 곳이 있는지 사용자와 정한다.
3. 의도를 판단할 수 없으면 추측하지 말고 사용자에게 두 쪽 내용을 보여 주고 묻는다.
4. 해결한 파일마다 `git add <파일>` 후 `git rebase --continue`. 다음 커밋에서 또 충돌하면 반복한다.
5. 도저히 안 되면 `git rebase --abort` 로 원래 상태로 돌아가고 사용자에게 알린다.

## 3단계: 검증 (CI 와 같은 조건)

```
git diff --check origin/main...HEAD     # 남은 충돌 표식·공백 오류
npx prettier --check . && npm run lint && npm run build && npm run test
node .github/scripts/check-release-manifest.mjs
```

실패하면 고친다. 고친 내용은 원인이 된 커밋에 넣기 어렵다면 새 커밋(`fix: 리베이스 후 ...`)으로 쌓는다.

## 4단계: push

이미 push 한 브랜치면 히스토리가 바뀌었으므로 강제 push 가 필요하다. **다른 사람의 커밋을 덮지 않게 반드시 `--force-with-lease`** 를 쓴다.

```
git push --force-with-lease
```

push 전에 사용자에게 한 번 확인받는다.

## 5단계: 결과

- 다시 쌓은 커밋 목록(`git log --oneline origin/main..HEAD`)과 충돌을 어떻게 풀었는지 파일별로 한 줄씩 알려 준다.
- 0단계에서 WIP 커밋을 만들었다면 `git reset --soft HEAD~1` 로 풀지 사용자에게 묻는다.
