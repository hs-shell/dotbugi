# 上級ガイド

## 科目トラッキング設定

LMSメインページの各科目カードにトラッキングトグルボタンが表示されます。

- **青いチェック**: トラッキング中 — ダッシュボードにタスクが表示されます。
- **半透明**: トラッキング解除 — ダッシュボードから非表示になります。

デフォルトではすべての正規科目がトラッキングされ、課外科目は除外されます。

|               トラッキング前                |              トラッキング追加              |
| :------------------------------------: | :-----------------------------------: |
| ![トラッキング前](/images/track-before.png) | ![トラッキング後](/images/track-after.png) |

## 検索とフィルター

上部の検索バーで科目名やタイトルで検索できます。

フィルターオプション:

- **科目別**: 特定の科目のみ表示
- **状態別**: 完了/未完了の項目をフィルタリング

フィルターが適用されると「フィルター設定済み」の表示が出ます。

<img src="/images/filter.png" alt="フィルター" style="max-width:320px;" />

## タスクの非表示

確認済みまたは不要な項目は非表示にできます。

- カードを**右クリック** → 「このタスクを非表示」を選択
- 科目グループヘッダーを右クリックすると、その科目のすべての項目を一括で非表示にできます。

非表示にした項目は設定タブの「非表示のタスク」で確認・復元できます。

|           非表示            |            非表示解除             |
| :-------------------------: | :--------------------------------: |
| ![非表示](/images/hide.png) | ![非表示解除](/images/unhide.png) |

## 講義ページのステータスバッジ

各講義のコースページでアクティビティ（講義/課題/クイズ）の横にステータスバッジが表示されます。

### 講義 (VOD)

<table>
  <thead><tr><th>バッジ</th><th>状態</th><th>意味</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">出席</span></td><td>出席</td><td>出席認定の必要時間以上を視聴完了</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #93c5fd 0%, #93c5fd 45%, #dbeafe 45%, #dbeafe 100%);color:#1e40af;border:1px solid #93c5fd;">視聴中 · 11日後</span></td><td>視聴中</td><td>一部視聴済み（進捗率を可視化）</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #fca5a5 0%, #fca5a5 45%, #fee2e2 45%, #fee2e2 100%);color:#b91c1c;border:1px solid #fca5a5;">視聴中 · 23時間後</span></td><td>視聴中（間近）</td><td>一部視聴 + 締切まで24時間以内</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">未視聴 · 6日後</span></td><td>未視聴</td><td>まだ視聴していない</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">未視聴 · 23時間後</span></td><td>未視聴（間近）</td><td>締切まで24時間以内</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">欠席</span></td><td>欠席</td><td>期限切れ</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">非表示</span></td><td>非表示</td><td>非表示にされた項目</td></tr>
  </tbody>
</table>

::: info 視聴中バッジ
視聴中バッジは進捗ページの学習時間データに基づいて進捗率を計算・表示します。
:::

### 課題 / クイズ

<div style="display:flex;gap:16px;flex-wrap:wrap;">
<div style="flex:1;min-width:280px;">

**課題**

<table>
  <thead><tr><th>バッジ</th><th>意味</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">提出済み</span></td><td>課題提出完了</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">未提出 · 6日後</span></td><td>締切まで1日以上</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">未提出 · 23時間後</span></td><td>締切まで24時間以内</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">未提出 (締切)</span></td><td>期限切れ</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">非表示</span></td><td>非表示にされた項目</td></tr>
  </tbody>
</table>

</div>
<div style="flex:1;min-width:280px;">

**クイズ**

<table>
  <thead><tr><th>バッジ</th><th>意味</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">受験済み</span></td><td>クイズ受験完了</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">未受験 · 6日後</span></td><td>締切まで1日以上</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">未受験 · 23時間後</span></td><td>締切まで24時間以内</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">未受験 (締切)</span></td><td>期限切れ</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">非表示</span></td><td>非表示にされた項目</td></tr>
  </tbody>
</table>

</div>
</div>

![講義ページ](/images/page.png)

## 自動再生プレーヤー

![プレーヤー](/images/player.png)

::: tip 倍速プログラムとの違い
ドットブギの自動再生は動画の速度を変更したり、再生時間を操作したりしません。**通常速度（1倍速）で正常再生**し、複数の講義をユーザーが手動でクリックしなくても連続再生する便利機能です。LMSに記録される再生時間と学習時間が同一のため、出席認定基準に一切影響しません。
:::

::: info スマート再生
- すでに出席処理された講義は自動的にスキップされます。
- 以前視聴した位置がある場合、その地点から再生を再開します。
:::

### 予想終了時間

再生中にボタンに残りの講義の予想終了時間が表示されます。

### 再生順序の変更

サイドバーの講義リストでドラッグ&ドロップにより再生順序を変更できます。

### ページ離脱の警告

自動再生中にページを離れようとすると警告が表示されます。

## 更新

<img src="/images/refresh.png" alt="更新" style="max-width:320px;" />

ドロップダウンメニューの更新ボタンでデータを更新できます。最後の更新から5分が経過すると赤い点が表示されます。1時間が経過すると自動的にデータが更新されます。

## お問い合わせ

<img src="/images/setting-tab.png" alt="更新" style="max-width:320px;" />

設定タブの下部からメールまたはKakaoTalkオープンチャットでお問い合わせいただけます。
