# 메인테이너 가이드

메인테이너 권한·배포 승인·운영 절차를 정리한다. 기여 절차는 [CONTRIBUTING.md](./CONTRIBUTING.md) 참고.

## 역할과 권한

| 역할          | GitHub 권한  | 할 수 있는 일                                  |
| ------------- | ------------ | ---------------------------------------------- |
| 프로젝트 오너 | **Admin**    | 저장소·브랜치 보호·환경 설정, 스토어 배포 승인 |
| 메인테이너    | **Maintain** | PR 리뷰·머지, 이슈 관리, 릴리즈 PR 머지        |
| 기여자        | 없음 (Fork)  | PR 제출                                        |

- **Admin 은 오너 외에 부여하지 않는다.** Admin 은 브랜치 보호·환경 승인 규칙을 직접 바꿀 수 있어 어떤 통제로도 막을 수 없다.
- 메인테이너는 **Maintain** 까지. Maintain 은 보호 규칙·환경·Variables 를 바꿀 수 없다.
- 오너·메인테이너 모두 GitHub 2단계 인증(가능하면 패스키) 필수.

## 배포 구조와 통제 지점

```text
PR 머지 (승인 1건 + CI)            ← 머지 통제
  → Release PR 머지 → GitHub Release + zip (자동)
  → stable/beta 환경 배포 승인      ← 배포 통제 (승인자: 오너)
  → GCP WIF 토큰 발급 → 스토어 업로드·심사 제출
```

- 스토어 게시용 장기 비밀은 저장소에 없다. 토큰은 승인된 `stable`/`beta` 환경 잡에서만 발급된다 (GCP WIF 조건).
- 배포 승인 요청은 Discord 로 온다. **승인 전 알림의 "변경 사항 보기" 링크로 직전 릴리즈 대비 변경을 확인한다.**

## 릴리즈 / 버전 규칙

릴리즈는 **release-please** 로 관리한다 (통합과 배포 분리).

- 평소 PR 을 main 에 머지해도 릴리즈는 나가지 않는다. release-please 가 Conventional Commits 를 읽어 **Release PR**(버전 범프 + CHANGELOG)을 자동으로 만들고 갱신한다.
- 발행하려면 **Release PR 을 머지**한다 → 태그 + GitHub Release + (활성화 시) stable 환경 승인 후 Chrome Web Store 게시.
- 버전은 커밋 타입에서 자동 산출된다 (`feat` → minor, `fix` → patch, `feat!`/`BREAKING CHANGE` → major). `build`/`ci`/`docs`/`chore` 는 버전을 올리지 않는다.
- **베타**: `Release Beta` 워크플로를 수동 실행하면 `vX.Y.Z-beta.N` 프리릴리즈가 발행된다 (스토어 manifest 버전은 `X.Y.Z.N`). 별도 베타 브랜치는 두지 않는다.

## 메인테이너 합류 시 체크리스트 (오너)

혼자 운영할 때는 승인해 줄 사람이 없어 꺼 둔 설정들을, 메인테이너가 생기면 켠다.

1. 조직에 `maintainers` 팀을 만들고 저장소 권한 **Maintain** 부여, 조직 2FA 필수화
2. `.github/CODEOWNERS` 의 `*` 줄을 `@hs-shell/maintainers` 로 변경 (민감 경로는 오너 유지)
3. 브랜치 보호(`main`)
   - **Require review from Code Owners** 켜기 → 민감 경로는 오너 승인 필수
   - **Require approval of the most recent reviewable push** 켜기 → 승인 후 몰래 커밋 추가 차단
   - **Do not allow bypassing the above settings**(관리자 포함 적용) 켜기 → 이제 서로 승인 가능하므로 `--admin` 머지 불필요
4. 환경(`stable`, `beta`)
   - **Allow administrators to bypass** 끄기
   - 배포 승인자를 늘린다면 **Prevent self-reviews** 반드시 켜기 (혼자일 때 켜면 아무도 승인 못 함)

## 일상 운영

- **머지**: 스쿼시 머지만 사용. PR 제목이 Conventional Commits 여야 release-please 가 버전을 산출한다.
- **Dependabot**: 버전 업데이트는 주 1회 그룹 PR(npm minor/patch, actions), major 는 개별 PR. 보안 업데이트는 생태계별 1개 PR 로 즉시 열린다. CI 통과를 확인하고 머지하되, major 는 변경 로그를 확인한다.
- **CodeRabbit**: 무료 한도가 시간당 1회라 여러 PR 을 동시에 올리면 리뷰가 밀린다. 필요하면 `@coderabbitai review` 로 재요청.
- **스토어 게시 점검**: Actions → `CWS Auth Check` 수동 실행 (읽기 전용).

## 비상 대응 (배포 경로 침해 의심 시)

1. `gh variable set ENABLE_STORE_PUBLISH --body false` — 자동 게시 즉시 중단
2. 스토어 개발자 대시보드에서 진행 중인 제출 취소, 계정 설정에서 서비스 계정 제거
3. GCP: 서비스 계정 사용 중지 또는 WIF 공급자(`github/dotbugi`) 사용 중지
4. 의심 계정의 저장소 권한 회수 후 원인 조사
