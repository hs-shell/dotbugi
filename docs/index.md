---
layout: home

head:
  - - script
    - {}
    - |
      if (!sessionStorage.getItem('lang-redirected')) {
        const lang = navigator.language?.toLowerCase() || '';
        const base = '/dotbugi/';
        const map = { en: 'en/', ja: 'ja/', zh: 'zh/' };
        const match = Object.entries(map).find(([k]) => lang.startsWith(k));
        if (match) {
          sessionStorage.setItem('lang-redirected', '1');
          window.location.replace(base + match[1]);
        }
      }

hero:
  name: 돋부기
  tagline: 학교 LMS를 더 편리하게
  image:
    src: /favicon.png
    alt: 돋부기
  actions:
    - theme: brand
      text: 사용 설명서
      link: /guide/basic
    - theme: alt
      text: FAQ
      link: /guide/faq
    - theme: alt
      text: 업데이트 로그
      link: /updates/changelog
---

<div class="cards">
  <a class="card" href="/dotbugi/guide/basic">
    <div class="card-icon" style="background: #dbeafe;">📖</div>
    <div class="card-body">
      <span class="card-title">간단 사용 설명서</span>
      <span class="card-desc">설치부터 대시보드, 자동 재생까지 기본 사용법을 알아봅니다.</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/guide/advanced">
    <div class="card-icon" style="background: #ffedd5;">⚙️</div>
    <div class="card-body">
      <span class="card-title">고급 사용 설명서</span>
      <span class="card-desc">필터, 배지, 숨기기 등 고급 기능을 활용해 보세요.</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/guide/calendar">
    <div class="card-icon" style="background: #ede9fe;">📅</div>
    <div class="card-body">
      <span class="card-title">Google 캘린더 연동</span>
      <span class="card-desc">과제·퀴즈 마감일을 캘린더에 자동 등록합니다.</span>
    </div>
  </a>
</div>

<div class="features">
  <div class="feature">
    <h3>할 일 대시보드</h3>
    <p>온라인 강의, 과제, 퀴즈를 한 화면에 모아 마감 상태를 색상으로 구분합니다.</p>
  </div>
  <div class="feature">
    <h3>자동 연속 재생</h3>
    <p>미수강 강의를 자동으로 연속 재생하여 수강을 빠르게 완료할 수 있습니다.</p>
  </div>
  <div class="feature">
    <h3>Google 캘린더 연동</h3>
    <p>과제·퀴즈 마감일을 Google 캘린더에 자동 등록하여 일정을 놓치지 않습니다.</p>
  </div>
  <div class="feature">
    <h3>강의 페이지 배지</h3>
    <p>강의 페이지에서 각 활동의 출석/제출 상태를 배지로 한눈에 확인할 수 있습니다.</p>
  </div>
  <div class="feature">
    <h3>다국어 지원</h3>
    <p>한국어, English, 中文, 日本語 4개 언어를 지원합니다.</p>
  </div>
</div>

<style>
.VPHome .vp-doc {
  max-width: 100% !important;
  padding: 0 !important;
}
.VPHome .vp-doc .container {
  max-width: 100% !important;
}
.vp-doc .cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 32px 48px;
}
.vp-doc .card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none !important;
  color: inherit !important;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}
.vp-doc .card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-6px);
}
.vp-doc .card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  padding: 68px 0;
}
.vp-doc .card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px 20px;
}
.vp-doc .card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.vp-doc .card-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.vp-doc .features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 32px 64px;
}
.vp-doc .feature {
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}
.vp-doc .feature h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.vp-doc .feature p {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
</style>
