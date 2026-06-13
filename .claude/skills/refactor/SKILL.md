---
name: refactor
description: 사용자가 "리팩토링해줘", "refactor", "규칙 맞춰줘", "컨벤션 적용" 등을 요청하거나, PR 생성 전 코드 정리가 필요할 때 사용
---

변경된 파일에 해당하는 프로젝트 rules를 로드하고, 컨벤션 위반을 찾아 수정하는 스킬.

## 1단계: 변경 파일 수집

```
git diff --name-only
git diff --staged --name-only
```

두 결과를 합쳐 중복 제거한다. 변경 파일이 없으면 알리고 종료한다.

## 2단계: 적용할 rules 결정

| 파일 경로 패턴                               | rules 파일                    |
| -------------------------------------------- | ----------------------------- |
| `src/**/*.ts`, `src/**/*.tsx`, `*.config.ts` | `.claude/rules/typescript.md` |

- **항상** `.claude/rules/common.md`를 포함한다.
- 매칭되는 rules 파일을 모두 읽는다.

## 3단계: 변경 내용 분석

```
git diff
git diff --staged
```

변경된 코드를 rules와 대조해 위반을 목록화한다.

## 4단계: 리팩토링 수행

발견된 위반을 수정한다. 수정 범위는 **변경된 코드에 한정** — 변경하지 않은 기존 코드는 건드리지 않는다.

수정 대상 예시:

- 주석 언어 (한국어)
- import 순서
- 매직 넘버/문자열
- TODO/FIXME 형식 (`// TODO(이슈번호): 내용`)
- 파일 역할 분리 위반
- Prettier 포맷 (single quote / semi / 120 / 2-space / es5 trailing comma)

## 5단계: 결과 보고

- 적용한 rules 파일
- 수정 항목별 한 줄
- 위반이 없으면 "위반 없음"
