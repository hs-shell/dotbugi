---
paths:
  - '**/*'
---

# 공통 규칙 (언어 무관)

- 주석 언어는 **한국어**.
- **1 파일 = 1 책임.** 섹션 구분자(`// ----`)로 한 파일에 여러 책임을 욱여넣지 말고 파일을 분리한다.
- 복잡하거나 비직관적인 로직에는 **"왜(why)"** 주석을 단다. "무엇(what)"은 코드로 드러나면 생략.
- **매직 넘버/매직 문자열 금지** — 의미 있는 상수로 추출한다. (LMS 키워드·셀렉터는 `src/lib/lmsKeywords.ts` 같은 단일 출처로)
- TODO/FIXME 는 `// TODO(이슈번호): 내용` 형식.
- 커밋 메시지는 **Conventional Commits**. 허용 타입의 기준은 `.github/workflows/pr-title.yml`이다: `feat`/`fix`/`docs`/`refactor`/`perf`/`test`/`chore`/`ci`/`style`/`build`/`revert`. 스쿼시 머지 + release-please가 PR 제목을 읽으므로 **PR 제목도 이 규칙을 따른다**.
- Prettier: single quote / semicolon / 120 폭 / 2-space / es5 trailing comma.

## PR 전 사전 검증 (CI 동일 조건)

PR 전에 통과시킨다 (`pr-checks` 워크플로와 동일 조건):

| 대상             | 검증                                     |
| ---------------- | ---------------------------------------- |
| 포맷             | `npx prettier --check .`                 |
| 린트             | `npm run lint`                           |
| 타입 체크 + 빌드 | `npm run build` (`tsc -b && vite build`) |
| 테스트           | `npm run test` (vitest)                  |

확장 동작 확인은 `npm run build` 후 `dist/`를 `chrome://extensions`에서 압축해제 로드.

> 이 프로젝트는 Rust/Python/DB 가 없다 — fmt/clippy/ruff/pytest/migration 류 검증은 해당 없음.
