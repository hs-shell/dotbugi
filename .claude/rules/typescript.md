---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - '*.config.ts'
---

# TypeScript / React 규칙

- **타입을 명시**한다. `any` 지양 — 불가피하면 이유 주석.
- React는 **함수형 컴포넌트 + hooks**. 클래스 컴포넌트 금지.
- import 순서: 외부 라이브러리 → 내부 모듈(`@/...` 또는 상대경로) → 스타일. 그룹 사이 빈 줄.
- 경로 별칭 `@/` → `./src`.
- 컴포넌트/모듈은 1 파일 1 책임.
- **LMS 스크래핑은 DOMParser 기반**(API 아님). 파서는 공용 패키지 `@dotbugi/lms-parser`(별도 저장소 hs-shell/dotbugi-lms-parser)에 있고, 확장은 `src/lib/fetchCourseData.ts`에서 브라우저 `fetchHtml`을 주입해 쓴다. 파서 수정은 패키지 저장소에서 한다.
- 중복 제거는 **키 생성기**(`src/lib/generateKey.ts`: `makeVodKey`, 과제·퀴즈용 `makeItemKey`, `makeVodGroupKey`)를 거친다 — 키 불일치로 중복이 새지 않도록.
- content script UI는 **Shadow DOM**으로 격리(`src/popover/lib/ShadowRootContext.tsx` 컨텍스트 경유).
- background ↔ content는 chrome 메시지 패싱으로 통신(Google OAuth 토큰 발급 등).
- 사용자에게 보이는 문자열은 i18n(`react-i18next`)을 통하고, 기본 언어는 한국어.
