---
layout: home

hero:
  name: ドットブギ
  tagline: 大学LMSをもっと便利に
  image:
    src: /favicon.png
    alt: ドットブギ
  actions:
    - theme: brand
      text: 使い方ガイド
      link: /ja/guide/basic
    - theme: alt
      text: よくある質問
      link: /ja/guide/faq
    - theme: alt
      text: アップデートログ
      link: /ja/updates/changelog
---

<div class="cards">
  <a class="card" href="/dotbugi/ja/guide/basic">
    <div class="card-icon" style="background: #dbeafe;">📖</div>
    <div class="card-body">
      <span class="card-title">基本ガイド</span>
      <span class="card-desc">インストールからダッシュボード、自動再生まで基本的な使い方を紹介します。</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/ja/guide/advanced">
    <div class="card-icon" style="background: #ffedd5;">⚙️</div>
    <div class="card-body">
      <span class="card-title">上級ガイド</span>
      <span class="card-desc">フィルター、バッジ、非表示などの高度な機能を活用しましょう。</span>
    </div>
  </a>
  <a class="card" href="/dotbugi/ja/guide/calendar">
    <div class="card-icon" style="background: #ede9fe;">📅</div>
    <div class="card-body">
      <span class="card-title">Googleカレンダー連携</span>
      <span class="card-desc">課題・クイズの締切をカレンダーに自動登録します。</span>
    </div>
  </a>
</div>

<div class="features">
  <div class="feature">
    <h3>タスクダッシュボード</h3>
    <p>オンライン講義、課題、クイズを一画面にまとめ、締切状況を色で区別します。</p>
  </div>
  <div class="feature">
    <h3>自動連続再生</h3>
    <p>未視聴の講義を倍速なしの通常速度（1倍速）で自動連続再生します。出席認定基準を正常に満たします。</p>
  </div>
  <div class="feature">
    <h3>Googleカレンダー連携</h3>
    <p>課題・クイズの締切をGoogleカレンダーに自動登録し、予定を見逃しません。</p>
  </div>
  <div class="feature">
    <h3>講義ページバッジ</h3>
    <p>講義ページで各アクティビティの出席・提出状況をバッジで一目で確認できます。</p>
  </div>
  <div class="feature">
    <h3>多言語対応</h3>
    <p>한국어、English、中文、日本語の4言語に対応しています。</p>
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
