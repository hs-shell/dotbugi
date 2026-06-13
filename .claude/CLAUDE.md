# Claude Code 팀 지침 (dotbugi)

> 프로젝트 개요·아키텍처·CI/CD 상세는 **루트 `CLAUDE.md`** 참조. 이 문서는 팀 작업 방식만 다룬다.

## MCP

- context7 사용 권장 상황: 라이브러리 API 확인, 코드 생성, 설정/구성 작업.

## 작업 원칙

- 작업은 최대한 작은 단위로 나눈다.
- Pair Programming: 질문·답변·논의를 반드시 진행.
- **1 PR = 1 Issue**, 이슈가 먼저 등록되어 있어야 한다(이슈-먼저 정책, `pr-checks`가 강제).
- 태스크 관리: GitHub Issues
  - `/create-issue` — 타입별(버그/기능/문서/작업) 본문까지 작성해 이슈 생성
  - `/analyze-issue` — 남이 올린 이슈를 검증·재현·중복 분석
  - `/issues` — 이슈 목록 조회
  - `/repro-test` — 버그를 고치기 전 재현하는 실패 테스트(vitest)부터 작성
  - `/implement` — 이슈 골라 구현 시작

## 브랜치 & 커밋 & PR

- 브랜치 전략: GitHub Flow (main + feature branch).
- 브랜치 네이밍: `<type>/<short-description>` (예: `fix/vod-parse`, 이슈 번호 포함 가능 `fix/123-vod-parse`).
- 커밋 메시지: **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `ci:`).
- PR 생성: `/create-pr`. 리뷰 반영: `/apply-pr-reviews`.
- **스쿼시 머지만 허용.** 스쿼시 커밋 제목 = PR 제목이 main에 남고 **release-please가 이를 읽어 버전을 산출**하므로, **PR 제목은 반드시 Conventional Commits**.

## 릴리즈

- **release-please** 기반. 일반 PR 머지는 릴리즈하지 않고 Release PR만 갱신, **Release PR을 머지할 때만** 발행.
- 베타는 `Release Beta` 워크플로 수동 실행(`vX.Y.Z-beta.N`). 상세는 루트 `CLAUDE.md`의 CI/CD 참조.

## 코드 컨벤션

- 주석 언어: 한국어.
- 파일 역할 분리: 1파일 = 1책임. 섹션 구분자 대신 파일 분리 우선.
- 복잡한 로직엔 "왜(why)" 주석.
- 언어별 상세 규칙: `.claude/rules/` (경로 스코프 — 해당 파일 작업 시 자동 로드).

## 프로젝트 문서 구조

```text
CLAUDE.md            # (루트) 프로젝트 개요·아키텍처·빌드·CI/CD — 핵심 참조
.claude/
  CLAUDE.md          # 팀 작업 방식 (이 문서)
  rules/             # 경로별 스코프 컨벤션 (common, typescript)
  skills/            # Claude Code 커스텀 스킬
```

- 아키텍처·데이터 흐름: 루트 `CLAUDE.md`
- 코드 컨벤션: `.claude/rules/`
- 태스크: `/issues` 또는 GitHub Issues

## 행동 지침

LLM 코딩 실수를 줄이는 행동 지침은 **루트 `CLAUDE.md` 상단**에 정의돼 있다(Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution). 그것을 따른다.
