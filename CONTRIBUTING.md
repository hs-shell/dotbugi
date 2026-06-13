# 기여 가이드

돋부기(Dotbugi)에 관심 가져주셔서 감사합니다.
이 문서는 기여 절차와 규칙을 정리한 것입니다.

## 시작하기 전에

1. **이슈 먼저 검색하기** — 작업을 시작하기 전에 [이슈 목록](https://github.com/hs-shell/dotbugi/issues)에서 같은 내용이 이미 있는지 확인해주세요.
2. **이슈 먼저 생성하기** — 모든 변경(버그 수정·기능 추가)은 **이슈가 먼저 등록되어 있어야 합니다.** 이슈에서 방향을 합의한 뒤 PR을 올려주세요.
3. 질문이나 사용 문의는 [Discussions](https://github.com/hs-shell/dotbugi/discussions)를 이용해주세요.

## 개발 환경

```bash
npm install        # 의존성 설치 (husky git hook 자동 설정)
npm run dev        # Vite 개발 서버
npm run build      # 타입 체크 + 프로덕션 빌드
npm run lint       # ESLint
npm run test       # 테스트
```

확장 프로그램은 `dist/`를 `chrome://extensions`에서 "압축해제된 확장 프로그램 로드"로 불러와 테스트합니다.

## 작업 흐름

1. 이 저장소를 **Fork**하고 브랜치를 만듭니다. (`feat/짧은-설명`, `fix/짧은-설명`)
2. 변경 후 커밋합니다. 커밋 메시지는 **Conventional Commits** 형식을 따릅니다. (아래 참고)
3. PR을 올립니다. PR 본문에 **연결된 이슈 번호**(`Closes #123`)를 반드시 적습니다.
4. 자동 검사를 통과해야 합니다.
   - `lint` / `prettier` / `build` / `test`
   - PR 본문에 이슈 참조가 있는지 확인하는 가드
   - **CodeRabbit AI 코드리뷰** (public 저장소에서 자동 실행)
5. 리뷰 피드백을 반영하면 메인테이너가 머지합니다.

## 커밋 메시지 규칙 (Conventional Commits)

커밋 메시지는 `commitlint`로 검증됩니다. 형식:

```text
<type>: <설명>

예시)
feat: 과제 마감 D-day 알림 추가
fix: VOD 출석 파싱 오류 수정
docs: 기여 가이드 추가
```

주요 type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

커밋 시 pre-commit 훅이 변경된 파일에 자동으로 `prettier` + `eslint --fix`를 적용합니다.

## 코드 스타일

- Prettier: single quote, 세미콜론, 120자 폭, 2-space, ES5 trailing comma
- 경로 별칭 `@/` → `./src`

## 릴리즈 / 버전 규칙 (메인테이너용)

- PR 라벨로 버전 범프가 결정됩니다: `🔖 patch`(기본) / `🔖 minor` / `🔖 major`
- `🚀 beta` 라벨이 있으면 베타(프리릴리즈) 채널로, 없으면 스테이블 채널로 릴리즈됩니다.
- 머지 후 릴리즈는 **승인 게이트**(GitHub Environment)를 통과해야 실제로 발행됩니다.
