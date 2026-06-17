<div align="center">
<h2>돋부기</h2>

<a target="_blank" href="https://chromewebstore.google.com/detail/hsu-%EB%8F%8B%EB%B6%80%EA%B8%B0-%F0%9F%94%8E/fbhdnbombekihdhjcfiimiibfmikghch"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome_Web_Store-v5.0.6-%234285F4?style=plastic&logo=chromewebstore&logoColor=white&labelColor=black" style="display:inline-block;"></a><!-- x-release-please-version -->
<img alt="License" src="https://img.shields.io/badge/license-Apache--2.0-%2300465B?style=plastic&labelColor=black" style="display:inline-block;">
<a target="_blank" href="https://www.youtube.com/watch?v=eOFc9TbMWVI"><img alt="YouTube" src="https://img.shields.io/badge/%EB%8D%B0%EB%AA%A8_%EB%B0%94%EB%A1%9C%EA%B0%80%EA%B8%B0-000000?style=plastic&logo=YouTube&logoColor=FFFFFF&label=YouTube&labelColor=FF0000"></a>

</div>

> [!NOTE]
> 한성대학교 LMS는 강의, 과제, 퀴즈가 과목마다 흩어져 있어 무엇이 남았고 무엇이 급한지 한눈에 보기 어렵다. 마감을 놓치거나 미수강 강의를 뒤늦게 발견하는 일이 반복된다.
>
> **돋부기**는 LMS 곳곳의 온라인 강의, 과제, 퀴즈를 하나의 대시보드로 모아 마감 상태를 한눈에 보여 준다. 미수강 강의는 출석 인정 기준에 맞춰 자동으로 이어 재생하고, 마감 일정은 Google 캘린더와 동기화한다.
>
> **학생은 흩어진 학습 정보를 한 곳에서 관리하고 마감을 놓치지 않을 수 있다.**

<br><br>

## 주요 기능

#### 할 일 대시보드

흩어진 온라인 강의, 과제, 퀴즈를 한 화면에 모아 마감 상태를 색으로 구분

- 과목을 넘나들지 않고 남은 활동과 제출 여부를 한눈에 확인
- 마감이 임박한 항목을 색상으로 강조

#### 자동 연속 재생

미수강 온라인 강의를 출석 인정 기준에 맞춰 자동으로 이어 재생

- 배속 없이 원래 속도(1배속)로 재생해 출석 인정 기준을 정상 충족
- 강의를 일일이 열지 않고 연속으로 수강

#### Google 캘린더 연동

과제, 퀴즈 마감일을 Google 캘린더에 자동 등록

- 인증 정보는 로컬에만 저장되며 외부로 전송되지 않음
- 평소 쓰던 캘린더에서 마감 일정을 함께 관리

#### 강의 페이지 배지

LMS 강의 페이지에서 각 활동의 출석, 제출 상태를 배지로 표시

> [!TIP]
> 강의 페이지를 열면 각 활동 옆에 출석·제출 상태 배지가 함께 표시돼, 대시보드를 열지 않고도 진행 상황을 확인할 수 있다

<br><br>

## 설치

#### 사용자

[Chrome 웹 스토어](https://chromewebstore.google.com/detail/hsu-%EB%8F%8B%EB%B6%80%EA%B8%B0-%F0%9F%94%8E/fbhdnbombekihdhjcfiimiibfmikghch)에서 설치한다.

#### 개발자 (로컬 빌드)

```bash
npm install
npm run build
```

`chrome://extensions`에서 개발자 모드를 켜고 빌드된 `dist/` 폴더를 **압축해제된 확장 프로그램으로 로드**한다. 자세한 개발 환경과 작업 절차는 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고한다.

<br><br>

## 기술 스택

![](https://go-skill-icons.vercel.app/api/icons?i=react,typescript,vite,tailwindcss&perline=12&theme=dark)

#### Frontend

- React 18 + TypeScript
- Vite + [@crxjs/vite-plugin](https://github.com/crxjs/chrome-extension-tools) (Manifest V3)
- shadcn/ui (Radix primitives) + Tailwind CSS
- framer-motion

#### Extension (진입점 2개)

- Content Script (`src/popover/index.tsx`) — Shadow DOM 기반 대시보드·비디오 플레이어·강의 상태 배지를 LMS 페이지에 주입
- Background Service Worker (`src/background.ts`) — `chrome.identity`로 Google OAuth 토큰 중개, 설치·아이콘 클릭 시 문서 사이트 열기

> [!NOTE]
> LMS API가 아니라 페이지 HTML을 DOMParser로 스크래핑해 데이터를 수집하며, 결과는 Chrome 스토리지에 24시간 TTL로 캐시한다.

<br><br>

## 문서

사용 설명서, FAQ, 개인정보 처리방침은 문서 사이트에서 확인할 수 있다.

- [문서 사이트](https://hs-shell.github.io/dotbugi)
- [개인정보 처리방침](https://hs-shell.github.io/dotbugi/privacy)
- [이용약관](https://hs-shell.github.io/dotbugi/terms)

<br><br>

## 기여

이 프로젝트는 **이슈 우선** 정책을 따른다. 모든 변경은 이슈를 먼저 등록하고 PR에서 참조해야 한다(`1 PR = 1 Issue`).

- 시작하기 전에 [CONTRIBUTING.md](./CONTRIBUTING.md)와 [행동 강령](./CODE_OF_CONDUCT.md)을 읽어 주세요.
- 커밋과 PR 제목은 [Conventional Commits](https://www.conventionalcommits.org/)를 따른다.

<br><br>

## 라이선스

[Apache-2.0](./LICENSE)
