---
layout: home

hero:
  name: 돋부기
  tagline: 让大学LMS更便捷
  image:
    src: /favicon.png
    alt: 돋부기
  actions:
    - theme: brand
      text: 使用说明
      link: /zh/guide/basic
    - theme: alt
      text: 常见问题
      link: /zh/guide/faq
    - theme: alt
      text: 更新日志
      link: /zh/updates/changelog
---

<div class="cards">
  <a class="card" href="/dotbugi/zh/guide/basic">
    <div class="card-icon" style="background: #dbeafe;">📖</div>
    <div class="card-body">
      <span class="card-title">基础使用说明</span>
      <span class="card-desc">从安装到仪表盘、自动播放，了解基本使用方法。</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/zh/guide/advanced">
    <div class="card-icon" style="background: #ffedd5;">⚙️</div>
    <div class="card-body">
      <span class="card-title">高级使用说明</span>
      <span class="card-desc">使用筛选、徽章、隐藏等高级功能。</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/zh/guide/calendar">
    <div class="card-icon" style="background: #ede9fe;">📅</div>
    <div class="card-body">
      <span class="card-title">Google 日历同步</span>
      <span class="card-desc">将作业和测验截止日期自动添加到日历中。</span>
    </div>
  </a>
</div>

<div class="features">
  <div class="feature">
    <h3>待办仪表盘</h3>
    <p>将在线课程、作业、测验汇集在一个界面，通过颜色区分截止状态。</p>
  </div>
  <div class="feature">
    <h3>自动连续播放</h3>
    <p>以原始速度（1倍速）自动连续播放未观看的课程，不使用倍速。完全符合出勤认定标准。</p>
  </div>
  <div class="feature">
    <h3>Google 日历同步</h3>
    <p>将作业和测验截止日期自动添加到 Google 日历，不再错过任何日程。</p>
  </div>
  <div class="feature">
    <h3>课程页面徽章</h3>
    <p>在课程页面上以徽章形式一目了然地查看各活动的出勤/提交状态。</p>
  </div>
  <div class="feature">
    <h3>多语言支持</h3>
    <p>支持한국어、English、中文、日本語四种语言。</p>
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
@media (max-width: 768px) {
  .vp-doc .cards {
    grid-template-columns: 1fr;
    padding: 0 20px 32px;
  }
  .vp-doc .features {
    grid-template-columns: 1fr;
    padding: 0 20px 48px;
  }
  .vp-doc .card-icon {
    padding: 40px 0;
    font-size: 36px;
  }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .vp-doc .cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .vp-doc .features {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
