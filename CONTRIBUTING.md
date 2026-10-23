# 기여 가이드

## 1. 이슈 먼저

모든 변경은 **이슈가 먼저 등록되어 있어야 합니다** (`1 PR = 1 Issue`).

1. [이슈 목록](https://github.com/hs-shell/dotbugi/issues)에서 같은 내용이 있는지 검색합니다.
2. 없으면 템플릿(버그 / 기능 요청 / 작업)을 골라 이슈를 등록하고, 이슈에서 방향을 합의합니다.
3. 사용 문의는 [Discussions](https://github.com/hs-shell/dotbugi/discussions)를 이용합니다.

## 2. 개발 환경

```bash
npm install        # 의존성 설치 (husky git hook 자동 설정)
```

### 명령어

| 명령                   | 용도                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Vite 개발 서버 — crx 플러그인이 빠지고 HTML 진입점이 없어 단독으로는 화면이 뜨지 않음. 확장 동작 확인은 빌드 후 로드 |
| `npm run build`        | 타입 체크 + 프로덕션 빌드 → `dist/` (스토어 업로드용과 동일)                                                         |
| `npm run build:mock`   | 개발용 mock 빌드 — `.env.mock` 의 과목으로 실제 LMS 데이터 조회, 날짜 필터 해제 ([아래](#mock-빌드-envmock))         |
| `npm run build:local`  | 로컬 테스트 빌드 — 스토어와 같은 확장 ID, `DEV` 표시 ([아래](#google-캘린더-연동을-로컬에서-테스트하려면))           |
| `npm run preview`      | `vite preview` — 확장 빌드에는 HTML 진입점이 없어 실사용 의미 없음                                                   |
| `npm run lint`         | ESLint                                                                                                               |
| `npm run format`       | Prettier 일괄 포맷                                                                                                   |
| `npm run test`         | 테스트 1회 실행 (Vitest)                                                                                             |
| `npm run test:watch`   | 테스트 감시 모드                                                                                                     |
| `npm run docs:dev`     | 문서 사이트(VitePress) 개발 서버                                                                                     |
| `npm run docs:build`   | 문서 사이트 빌드                                                                                                     |
| `npm run docs:preview` | 문서 사이트 빌드 미리보기                                                                                            |

베타 채널로 빌드하려면 앞에 `RELEASE_CHANNEL=beta` 를 붙입니다. (예: `RELEASE_CHANNEL=beta npm run build`)

PR 전에 CI(`verify`)와 같은 검사를 로컬에서 돌려 보세요: `npx prettier --check .` → `npm run lint` → `npm run build` → `node .github/scripts/check-release-manifest.mjs` → `npm run test`

### mock 빌드 (`.env.mock`)

특정 과목이나 지난 학기 데이터로 화면을 확인할 때 씁니다. 콘텐츠 스크립트는 그대로 LMS 페이지에서 동작하므로 **LMS 로그인이 필요**합니다.

`.env.mock` 은 저장소에 포함되지 않으므로(`.gitignore`) 예시 파일을 복사해 만듭니다: `cp .env.mock.example .env.mock`

| 변수                         | 동작                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_MOCK`                  | `true` 여야 mock 동작이 켜진다 (하드코딩 mockData, 캘린더 토큰 만료 재현, 디버그 배지, 짧은 타이머)                                              |
| `VITE_MOCK_COURSES`          | 페이지에서 과목 목록을 읽는 대신 지정한 과목(JSON 배열)으로 실제 LMS 데이터를 가져온다. 비우면(`VITE_MOCK=true` 일 때) 하드코딩 mockData 만 표시 |
| `VITE_MOCK_SKIP_DATE_FILTER` | 마감·기간 필터를 꺼 지난 학기 과목도 표시 (값이 있으면 켜짐 — 끄려면 줄을 삭제)                                                                  |

`build:mock` 은 항상 개발용 OAuth client_id 를 쓰고, `VITE_MOCK=true` 이면 시작 시 캘린더 토큰 만료 상태를 재현합니다.

### 확장 로드

`npm run build` 후 `chrome://extensions`에서 개발자 모드를 켜고 `dist/`를 **압축해제된 확장 프로그램으로 로드**해 확인합니다.

### Google 캘린더 연동을 로컬에서 테스트하려면

압축해제로 로드한 확장은 ID가 폴더 경로로 정해져 Google 로그인이 거부됩니다. 대신 **로컬 테스트 빌드**를 사용합니다.

```bash
npm run build:local                          # 정식 항목과 같은 확장 ID
RELEASE_CHANNEL=beta npm run build:local     # 베타 항목과 같은 확장 ID
```

- manifest 에 스토어 항목의 공개 키(`key`)가 들어가 스토어 버전과 같은 확장 ID 가 되고, 초록색 `DEV` 아이콘과 `(Dev)` 이름으로 표시됩니다.
- 같은 ID 의 스토어 버전이 설치돼 있으면 함께 로드할 수 없으니 **스토어 버전을 삭제**하거나 **별도 Chrome 프로필**에서 테스트하세요.
- 이 빌드는 스토어에 올릴 수 없습니다 (CI 가 `key` 포함 여부를 검사).

## 3. 작업 흐름

1. 저장소를 **Fork**하고 브랜치를 만듭니다. (`<type>/<짧은-설명>`, 예: `fix/vod-parse`, `feat/123-quiz-filter`)
2. 변경 후 커밋합니다. pre-commit 훅이 변경 파일에 `prettier` + `eslint --fix`를 자동 적용합니다.
3. PR을 올립니다.
   - **제목**: Conventional Commits 형식 (스쿼시 머지 시 이 제목이 커밋 메시지가 되고, 버전 산출에 쓰입니다)
   - **본문**: 연결된 이슈를 `Closes #123` 형식으로 적습니다.
4. 필수 검사를 통과하고 승인 1건을 받아야 머지됩니다.
   - 이슈 참조 확인 (`issue-link`)
   - `prettier` / `lint` / `build` / manifest 검사 / `test` (`verify`)
   - CodeRabbit AI 코드 리뷰
   - PR 제목 검사(`validate`)도 함께 실행되니 통과시켜 주세요.
5. 리뷰 피드백을 반영하면 메인테이너가 머지합니다.

## 4. 커밋 / PR 제목 규칙 (Conventional Commits)

```text
<type>: <설명>

feat: 과제 마감 D-day 알림 추가
fix: VOD 출석 파싱 오류 수정
docs: 기여 가이드 정리
```

| type       | 용도                        |
| ---------- | --------------------------- |
| `feat`     | 기능 추가                   |
| `fix`      | 버그 수정                   |
| `docs`     | 문서                        |
| `refactor` | 동작 변화 없는 구조 개선    |
| `perf`     | 성능 개선                   |
| `test`     | 테스트                      |
| `style`    | 포맷 등 코드 의미 없는 변경 |
| `build`    | 빌드·의존성                 |
| `ci`       | CI 설정                     |
| `chore`    | 기타                        |
| `revert`   | 되돌리기                    |

## 5. 코드 스타일

- Prettier: single quote, 세미콜론, 120자 폭, 2-space, ES5 trailing comma
- 경로 별칭 `@/` → `./src`
- 주석은 한국어로, 복잡한 로직에는 "왜"를 적습니다.
- 사용자에게 보이는 문자열은 i18n(`react-i18next`)을 거칩니다.
