---
description: 사용자가 "이슈 만들어", "버그 등록", "기능 제안 이슈", "작업 추가" 등을 요청하거나, 새 작업·리포트를 GitHub Issue 로 등록해야 할 때 사용
---

GitHub Issue 를 **이슈 템플릿(`.github/ISSUE_TEMPLATE/`)을 그대로 채워서** 만든다. (저장소: `hs-shell/dotbugi`)

`gh issue create` 는 YAML 폼 템플릿을 적용하지 않으므로, 템플릿 파일을 읽어 웹 폼이 만드는 것과 같은 본문을 직접 렌더링한다.

## 1단계: 중복 확인

```
gh issue list --repo hs-shell/dotbugi --state all --search "<핵심어>" --limit 10
```

비슷한 이슈가 있으면 사용자에게 보여 주고, 새로 만들지 그 이슈에 댓글을 달지 묻는다.

## 2단계: 타입 → 템플릿

| 타입                   | 템플릿                                       | 라벨                                       |
| ---------------------- | -------------------------------------------- | ------------------------------------------ |
| 버그                   | `.github/ISSUE_TEMPLATE/bug_report.yml`      | `bug`                                      |
| 기능 제안              | `.github/ISSUE_TEMPLATE/feature_request.yml` | `feat`                                     |
| 작업(문서·CI·리팩터링) | `.github/ISSUE_TEMPLATE/task.yml`            | 성격에 맞게 `chore`/`docs`/`ci`/`refactor` |

- 애매하면 묻는다. 제목에 `[Bug]` 같은 접두어나 Conventional Commits(`fix:`)를 붙이지 않는다 — 타입은 라벨이 나타낸다.

## 3단계: 본문 렌더링

1. 템플릿 파일을 읽는다.
2. `body:` 항목을 GitHub 폼 결과처럼 바꾼다.
   - `markdown`(안내문)은 넣지 않는다.
   - `textarea`/`input`/`dropdown` → `### <label>` 아래에 답. 비어 있는 선택 칸은 `_No response_`.
   - `checkboxes`(확인) → `- [x] <option>`. 실제로 확인한 것만 `x` 로 두고, 확인하지 못한 필수 항목은 사용자에게 묻는다.
   - `render:` 가 있는 칸은 그 언어로 코드 블록을 감싼다.
3. `required: true` 칸은 비우지 말고 사용자에게 물어 채운다.
4. 로그·스크린샷에 학번·이름·세션 쿠키이 있으면 지운다.

## 4단계: 생성

```
gh issue create --repo hs-shell/dotbugi --title "<설명>" --label "<라벨>" --body-file <렌더링한 본문 파일>
```

## 5단계: 결과

이슈 번호와 URL 을 알려 주고, 바로 작업하려면 `/implement <번호>`, 남이 올린 이슈를 분석하려면 `/analyze-issue <번호>` 를 안내한다.
