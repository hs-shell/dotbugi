# 기여 가이드

## 1. 이슈 먼저

모든 변경은 **이슈가 먼저 등록되어 있어야 합니다** (`1 PR = 1 Issue`).

1. [이슈 목록](https://github.com/hs-shell/dotbugi/issues)에서 같은 내용이 있는지 검색합니다.
2. 없으면 템플릿(버그 / 기능 요청 / 작업)을 골라 이슈를 등록하고, 이슈에서 방향을 합의합니다.
3. 사용 문의는 [Discussions](https://github.com/hs-shell/dotbugi/discussions)를 이용합니다.

## 2. 개발 환경

```bash
npm install        # 의존성 설치 (husky git hook 자동 설정)
npm run dev        # Vite 개발 서버
npm run build      # 타입 체크 + 프로덕션 빌드
npm run lint       # ESLint
npm run test       # 테스트
```

`npm run build` 후 `chrome://extensions`에서 개발자 모드를 켜고 `dist/`를 **압축해제된 확장 프로그램으로 로드**해 확인합니다.

## 3. 작업 흐름

1. 저장소를 **Fork**하고 브랜치를 만듭니다. (`<type>/<짧은-설명>`, 예: `fix/vod-parse`, `feat/123-quiz-filter`)
2. 변경 후 커밋합니다. pre-commit 훅이 변경 파일에 `prettier` + `eslint --fix`를 자동 적용합니다.
3. PR을 올립니다.
   - **제목**: Conventional Commits 형식 (스쿼시 머지 시 이 제목이 커밋 메시지가 되고, 버전 산출에 쓰입니다)
   - **본문**: 연결된 이슈를 `Closes #123` 형식으로 적습니다.
4. 자동 검사를 통과해야 머지됩니다.
   - 이슈 참조 확인, PR 제목 검사
   - `prettier` / `lint` / `build` / `test`
   - CodeRabbit AI 코드 리뷰
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
