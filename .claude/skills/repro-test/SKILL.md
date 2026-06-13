---
description: 사용자가 "재현 테스트", "repro test", "버그 재현 테스트 먼저", "failing test 만들어", "이 버그 테스트로 잡아" 등을 요청하거나, 버그를 고치기 전에 재현하는 실패 테스트를 작성해야 할 때 사용
---

버그를 고치기 전에 **그 버그를 재현하는 실패 테스트(vitest)를 먼저 작성**하는 스킬. (Goal-Driven: 버그는 재현 테스트부터 → 통과시키기)

이슈/제보의 원인 위치는 먼저 `/analyze-issue`로 파악한 뒤 이 스킬로 넘어오면 좋다.

## 1단계: 재현 조건 확정

- 버그 이슈면 `gh issue view <번호> --repo hs-shell/dotbugi --json title,body`로 증상·입력을 읽는다.
- "어떤 입력에서 / 무엇을 기대했는데 / 실제로 무엇이 나오는지"를 한 문장으로 정리한다.

## 2단계: 테스트 작성 (이 프로젝트 패턴)

- 위치: `src/__tests__/<대상>.test.ts` (기존 파일에 케이스 추가 우선, 없으면 새 파일).
- 프레임워크: **vitest** (`import { describe, it, expect } from 'vitest'`), 대상은 `@/` 별칭으로 import.
- **HTML 파싱 버그**: 픽스처 디렉토리는 없다 — 기존 테스트처럼 **HTML 스니펫을 인라인으로 만들어 DOMParser로 Document를 생성**해 파서에 넣는다. (`fetchVodAttendance.test.ts`의 `makeDoc` 헬퍼 패턴 참고)
  ```ts
  function makeDoc(html: string): Document {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  ```
- **로직 버그**(중복 제거/날짜/키 생성 등): 해당 함수(`makeVodKey`, `deduplicateInto`, `dateUtils` 등)를 버그 유발 입력으로 직접 호출해 단언한다.
- 단언은 **기대 동작**(고쳐졌을 때의 결과)으로 작성한다 — 지금은 실패해야 정상.

## 3단계: 실패 확인 (Red)

```
npm run test
```

- 새 테스트가 **실패하는지** 확인한다. 실패하지 않으면 재현이 안 된 것 — 조건을 다시 좁힌다(이미 통과하면 버그가 다른 곳이거나 이미 고쳐졌을 수 있음 → 사용자에게 알림).

## 4단계: 인계

- 재현 테스트가 빨갛게 뜨는 것을 확인했으면, `/implement <번호>`(또는 바로 수정)로 넘어가 **이 테스트를 통과(Green)시키는 방향**으로 고친다.
- 수정 후 `npm run test`로 해당 테스트 + 전체(298+)가 통과하는지 확인한다.

## 주의

- 재현 테스트는 버그 케이스에 **최소**로 집중한다 — 관련 없는 케이스를 같이 넣지 않는다.
- 테스트 설명은 한국어로, "왜 이게 버그인지"가 드러나게 적는다.
