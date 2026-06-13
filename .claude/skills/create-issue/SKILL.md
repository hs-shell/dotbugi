---
description: 사용자가 "이슈 만들어", "버그 등록", "기능 제안 이슈", "작업 추가" 등을 요청하거나, 새 작업/리포트를 GitHub Issue로 등록해야 할 때 사용
---

GitHub Issue를 **실제 이슈 템플릿(`.github/ISSUE_TEMPLATE/`)을 그대로 채워서** 생성하는 스킬. (저장소: `hs-shell/dotbugi`)

`gh issue create`는 YAML 템플릿을 자동 적용하지 않으므로, **스킬이 템플릿 파일을 읽어 그 구조대로 본문을 렌더링**한다. 그래야 CLI로 만든 이슈가 웹 폼으로 만든 이슈와 동일한 형태가 된다.

## 1단계: 타입 → 템플릿 결정

사용자 설명에서 타입을 추론하고, 애매하면 묻는다.

| 타입              | 템플릿 파일                                  | 제목 prefix | 라벨                                       |
| ----------------- | -------------------------------------------- | ----------- | ------------------------------------------ |
| 🐛 버그           | `.github/ISSUE_TEMPLATE/bug_report.yml`      | `[Bug]`     | `bug`                                      |
| ✨ 기능 제안      | `.github/ISSUE_TEMPLATE/feature_request.yml` | `[Feat]`    | `feat`                                     |
| 🧹 작업/문서/기타 | `.github/ISSUE_TEMPLATE/task.yml`            | `[Task]`    | 성격에 맞게 `chore`/`docs`/`ci`/`refactor` |

- 제목 prefix는 템플릿의 `title` 값을 그대로 따른다 (예: `[Bug]` 뒤에 공백 한 칸 포함).
- 이슈 제목엔 Conventional Commits(`fix:` 등)를 쓰지 않는다 — 그건 PR/커밋용.

## 2단계: 템플릿을 읽어 본문 렌더링

1. 해당 템플릿 파일을 **읽는다**(Read).
2. `body:`의 각 항목을 GitHub가 폼에서 만들듯이 마크다운으로 변환한다:
   - `markdown` 타입(안내문)은 본문에 넣지 않는다 — 작성 가이드일 뿐.
   - `textarea`/`input`/`dropdown`/`checkboxes`의 `attributes.label`을 `### <label>` 제목으로, 그 아래 사용자 답변을 채운다.
   - `checkboxes`는 `- [ ] <option>`, 충족한 항목은 `- [x]`.
3. `validations.required: true`인 칸은 비워두지 말고 **사용자에게 물어 채운다.**

## 3단계: 생성

```
gh issue create --repo hs-shell/dotbugi \
  --title "<prefix><설명>" \
  --label "<타입 라벨>" \
  --body "<렌더링한 본문>"
```

- 템플릿 frontmatter에 `labels:`가 있으면 합친다. 담당자가 필요하면 `--assignee`.

## 4단계: 결과

생성된 이슈 번호와 URL을 출력한다.

- 다음 액션 안내: 직접 작업할 거면 `/implement <번호>`, 남이 올린 이슈의 원인·위치를 분석할 거면 `/analyze-issue <번호>`.
