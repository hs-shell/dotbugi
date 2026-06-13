---
description: 사용자가 "이슈 분석", "이 문제 어디 있는지 찾아", "이 버그 원인 찾아줘", "analyze issue N", "구현 전에 원인 파악" 등을 요청하거나, 제보된 이슈의 원인·위치를 코드에서 찾아야 할 때 사용
---

제보된 GitHub Issue를 읽고 **문제가 코드 어디에 있는지·원인이 무엇인지 찾는 분석 스킬**. (저장소: `hs-shell/dotbugi`)

오픈소스 이슈는 사용자 **제보**에 가깝다. 이 스킬의 목적은 구현 전에 **개발자가 원인·위치를 파악**하는 것이다 — 분석 결과를 제보자 이슈에 다시 코멘트로 적는 게 아니다(기본). 결과는 **대화로 개발자에게 보고**한다.

## 1단계: 이슈 로드

- `$ARGUMENTS`에 번호가 있으면 그 이슈, 없으면 `/issues`로 목록을 보여주고 선택받는다.

```
gh issue view <번호> --repo hs-shell/dotbugi --json number,title,body,labels,author
```

## 2단계: 원인·위치 추적 (추측 금지)

증상에서 출발해 관련 코드를 찾아 들어간다.

1. **위치 찾기**: `hedwig-cg search "<영어 키워드>"`로 관련 파일을 먼저 좁힌다(쿼리는 영어). seed `file:line`을 `Read`로 열고, 구체 심볼은 `Grep`으로 확인.
   - 영역 힌트: VOD/출석 → `src/lib/fetchVodAttendance.ts`·`fetchVodProgress.ts`, 과제 → `fetchAssign.ts`, 퀴즈 → `fetchQuiz.ts`, 집계 → `fetchCourseData.ts`·`useCourseData.tsx`, 중복 → 키 생성기(`makeVodKey` 등), UI → `src/popover/`.
2. **원인 가설**: 어떤 코드 경로에서 증상이 나오는지 가설을 세우고 코드로 검증한다. LMS HTML 파싱 문제면 해당 셀렉터/키워드(`src/lib/lmsKeywords.ts`)와 파싱 로직을 본다.
3. **유효성/중복**: 재현 가능한지, 정보가 충분한지, 중복인지 — `gh issue list --repo hs-shell/dotbugi --search "<키워드>" --state all`.

## 3단계: 개발자에게 보고 (대화)

다음을 대화로 정리한다. 확인된 사실과 추측을 구분하고 파일·라인을 인용한다.

- **원인 추정**: `src/lib/fetchVodAttendance.ts:NN` — 무엇이 왜 문제인지
- **영향 범위**: 어떤 기능이 깨지는지
- **유효성**: 유효 / 정보 부족 / 중복(→ `#N`) / 범위 밖
- **권장 다음 단계**: 수정 방향, 착수 가능하면 `/implement <번호>`

## 4단계: (선택) 작성자에게 정보 요청 — 기본 OFF

분석 결과를 이슈에 자동으로 적지 않는다. **정보가 정말 부족해 진행이 막힐 때만**, 사용자가 명시적으로 요청하면 작성자에게 추가 정보를 요청하는 코멘트를 남긴다.

```
gh issue comment <번호> --repo hs-shell/dotbugi --body "<필요한 정보 요청>"
```

## 주의

- 리포터가 항상 맞지는 않다 — 코드/동작으로 검증한 뒤 판단한다.
- 분석까지가 이 스킬의 범위다. 구현은 `/implement`로 별도 진행(1 PR = 1 Issue).
