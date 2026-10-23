# Changelog

## [5.2.0](https://github.com/hs-shell/dotbugi/compare/v5.1.0...v5.2.0) (2026-10-23)


### Features

* VOD 다운로드 버튼 — 암호화 없는 HLS 를 MP4 로 저장 ([#183](https://github.com/hs-shell/dotbugi/issues/183)) ([da801b8](https://github.com/hs-shell/dotbugi/commit/da801b870d3b2b3d947017ed6cf099a3dc2543fa))


### Bug Fixes

* 5.1.0 회귀 점검 후속 — 토글 누락·연결 콘솔 오류·플레이어 첫 열림 등 ([#179](https://github.com/hs-shell/dotbugi/issues/179)) ([1d545c6](https://github.com/hs-shell/dotbugi/commit/1d545c66387bb3feccf47d3693304e27c8165820)), closes [#174](https://github.com/hs-shell/dotbugi/issues/174)
* **deps:** @dotbugi/lms-parser 0.1.1 반영 — KST 날짜·퀴즈 실패 처리·상대 링크 수정 ([e3274e3](https://github.com/hs-shell/dotbugi/commit/e3274e3f12773098a8c47592b50f26faf85da9fb))
* **deps:** @dotbugi/lms-parser 0.1.1 반영 ([#176](https://github.com/hs-shell/dotbugi/issues/176)) ([e3274e3](https://github.com/hs-shell/dotbugi/commit/e3274e3f12773098a8c47592b50f26faf85da9fb))
* MCP 연결 성공 후 확인 창을 5초 뒤 자동으로 닫기 ([#181](https://github.com/hs-shell/dotbugi/issues/181)) ([fc78832](https://github.com/hs-shell/dotbugi/commit/fc788327a3dcdea87e01f2271c254acd996d41d2))
* Tailwind v4 전환 후 애니메이션 속도·대시보드 팝오버 모션을 5.0.5 와 같게 ([#178](https://github.com/hs-shell/dotbugi/issues/178)) ([9e4722f](https://github.com/hs-shell/dotbugi/commit/9e4722fe98bc3a7085ba6196cfe5ee4d5415190b)), closes [#175](https://github.com/hs-shell/dotbugi/issues/175)
* 대시보드 팝오버 열기·닫기를 페이드로 ([#185](https://github.com/hs-shell/dotbugi/issues/185)) ([9b3b1ed](https://github.com/hs-shell/dotbugi/commit/9b3b1edf15fff36a9e34405abd9c5347e097470b))
* 초기 새로고침 결과를 초기 과목 기준으로 걸러 대시보드가 비지 않게 ([#187](https://github.com/hs-shell/dotbugi/issues/187)) ([fe708ba](https://github.com/hs-shell/dotbugi/commit/fe708ba4ed5721a4f268dc0038186c2211b31f9f))
* 플레이어 팝오버도 대시보드와 같은 페이드로, 열 때 위치 튐 제거 ([#189](https://github.com/hs-shell/dotbugi/issues/189)) ([011af04](https://github.com/hs-shell/dotbugi/commit/011af042a2fec8de99a3cb51cf13ccf79b064c60))

## [5.1.0](https://github.com/hs-shell/dotbugi/compare/v5.0.5...v5.1.0) (2026-10-23)


### Features

* dotbugi-mcp 연결 기능 (localhost 콜백) ([#168](https://github.com/hs-shell/dotbugi/issues/168)) ([195314b](https://github.com/hs-shell/dotbugi/commit/195314bce403cbd9f20ae816c59bcc3e0d778202))
* 로컬 테스트 빌드에 manifest key 주입해 캘린더 OAuth 로컬 테스트 지원 ([#161](https://github.com/hs-shell/dotbugi/issues/161)) ([12a2462](https://github.com/hs-shell/dotbugi/commit/12a246251c7890e46f790954fe7c6027b0a05221)), closes [#160](https://github.com/hs-shell/dotbugi/issues/160)
* 베타 채널 별도 항목 Chrome Web Store 자동배포 골격 ([#113](https://github.com/hs-shell/dotbugi/issues/113)) ([cb76bad](https://github.com/hs-shell/dotbugi/commit/cb76bad35a9e8a4b603374d0b9c4aa8e83e3ce35))


### Bug Fixes

* pr-autolabel 타입 미검출 시 기존 라벨 보존 ([#90](https://github.com/hs-shell/dotbugi/issues/90)) ([ee5f445](https://github.com/hs-shell/dotbugi/commit/ee5f44569a3feac08ed972e1d8dd87052de72c19)), closes [#89](https://github.com/hs-shell/dotbugi/issues/89)
* 릴리즈 Discord 알림 단계가 항상 건너뛰어지는 문제 수정 ([#165](https://github.com/hs-shell/dotbugi/issues/165)) ([d20f1f7](https://github.com/hs-shell/dotbugi/commit/d20f1f71f6eeb993e661e105413987e2632d03ce)), closes [#164](https://github.com/hs-shell/dotbugi/issues/164)
* 베타 확장 이름 표시 버그 수정 및 베타 OAuth client_id 설정 ([#139](https://github.com/hs-shell/dotbugi/issues/139)) ([a2ebf44](https://github.com/hs-shell/dotbugi/commit/a2ebf4423b4de37aabf51d0aed4c75fdacef8977))
* 스크래핑한 LMS URL 을 열기 전에 출처 확인 ([#172](https://github.com/hs-shell/dotbugi/issues/172)) ([4531919](https://github.com/hs-shell/dotbugi/commit/45319191d040e82298887e7cc7806cfa47421d4d))
