---
description: 사용자가 "테스트 써줘", "테스트 추가", "커버리지 올려줘" 등을 요청하거나, 코드 변경에 맞는 vitest 테스트를 작성해야 할 때 사용 (버그 재현 테스트는 /repro-test)
---

이 저장소의 패턴대로 **vitest** 테스트를 쓴다. `src/` 를 바꾼 PR 은 테스트도 바꿔야 `테스트 필수` 검사를 통과한다. 버그를 고치기 전 재현 테스트는 `/repro-test` 를 쓴다.

## 1단계: 무엇을 확인할지 한 문장으로

"어떤 입력에서 / 무엇을 기대하는지". 이슈가 있으면 `gh issue view <번호> --repo hs-shell/dotbugi` 로 완료 기준을 읽는다.

## 2단계: 위치

`src/__tests__/<대상>.test.ts` (컴포넌트·훅은 `.test.tsx`). **같은 대상의 기존 파일이 있으면 거기에 케이스를 추가**한다.

## 3단계: 이 저장소 패턴

- vitest + jsdom, `globals: true`. 대상은 `@/` 별칭으로 import 한다.
- `src/__tests__/setup.ts` 가 i18n 을 키 그대로 돌려주게 막는다 — 문구는 번역 키로 단언한다.
- 설명은 한국어로, 동작이 드러나게 쓴다.
- **순수 함수**(`src/lib`): 경계·이상 입력으로 직접 부르고 결과를 단언한다 (`dateUtils.test.ts`, `stringUtils.test.ts`).
- **LMS HTML 파싱**: 픽스처 디렉토리 없이 인라인 HTML 을 `document.body.innerHTML` 에 넣거나 `new DOMParser().parseFromString(html, 'text/html')` 로 만든다 (`injectBadges.test.ts`, `vodDownload.test.ts`). LMS 파서 자체는 `@dotbugi/lms-parser` 저장소에서 테스트한다.
- **chrome.\* API**: `vi.stubGlobal('chrome', …)` 등으로 필요한 메서드만 가짜로 만든다 (`storage.test.ts`, `backgroundAuthRouting.test.ts` 참고). 네트워크는 `fetch` 를 막는다.
- **훅·컴포넌트**: `@testing-library/react` 는 없다. `react-dom/client` 의 `createRoot` + `act` 로 작은 하네스 컴포넌트를 그려 확인한다 (`useCourseDataRefresh.test.tsx` 참고). 새 의존성은 넣지 않는다. shadcn 래퍼(`components/ui`)처럼 동작이 없는 UI 는 테스트하지 않는다.
- 시간: `vi.useFakeTimers()` / `vi.setSystemTime()`.

## 4단계: 실행

```
npx vitest run src/__tests__/<파일>.test.ts   # 이 파일만
npm run test:coverage                          # 전체 + 커버리지
```

바꾼 소스 파일의 `Uncovered Line #s` 에 의미 있는 분기가 남았으면 케이스를 더한다. 숫자를 올리려고 의미 없는 단언을 넣지 않는다.

## 주의

- 한 케이스는 한 동작만.
- 구현 세부보다 바깥에서 보이는 결과를 단언한다.
