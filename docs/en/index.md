---
layout: home

hero:
  name: Dotbugi
  tagline: Make your LMS more convenient
  image:
    src: /favicon.png
    alt: Dotbugi
  actions:
    - theme: brand
      text: User Guide
      link: /en/guide/basic
    - theme: alt
      text: Update Log
      link: /en/updates/changelog
---

<div class="cards">
  <a class="card" href="/dotbugi/en/guide/basic">
    <div class="card-icon" style="background: #dbeafe;">📖</div>
    <div class="card-body">
      <span class="card-title">Basic User Guide</span>
      <span class="card-desc">Learn the basics from installation to the dashboard and auto-play.</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/en/guide/advanced">
    <div class="card-icon" style="background: #ffedd5;">⚙️</div>
    <div class="card-body">
      <span class="card-title">Advanced User Guide</span>
      <span class="card-desc">Explore advanced features like filters, badges, and hiding tasks.</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/en/guide/calendar">
    <div class="card-icon" style="background: #ede9fe;">📅</div>
    <div class="card-body">
      <span class="card-title">Google Calendar Integration</span>
      <span class="card-desc">Automatically add assignment and quiz deadlines to your calendar.</span>
    </div>
  </a>
</div>

<div class="features">
  <div class="feature">
    <h3>Task Dashboard</h3>
    <p>View online lectures, assignments, and quizzes in one screen with color-coded deadline statuses.</p>
  </div>
  <div class="feature">
    <h3>Auto Continuous Playback</h3>
    <p>Automatically play unwatched lectures in sequence to complete your coursework quickly.</p>
  </div>
  <div class="feature">
    <h3>Google Calendar Integration</h3>
    <p>Automatically register assignment and quiz deadlines to Google Calendar so you never miss a due date.</p>
  </div>
  <div class="feature">
    <h3>Course Page Badges</h3>
    <p>Instantly check the attendance/submission status of each activity with badges on the course page.</p>
  </div>
  <div class="feature">
    <h3>Multi-language Support</h3>
    <p>Supports 4 languages: Korean, English, Chinese, and Japanese.</p>
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
