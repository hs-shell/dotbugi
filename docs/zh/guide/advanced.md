# 高级使用说明

## 科目跟踪设置

LMS 主页面的每个科目卡片上会显示跟踪切换按钮。

- **蓝色勾选**: 跟踪中 — 待办事项将显示在仪表盘中。
- **半透明**: 取消跟踪 — 从仪表盘中隐藏。

默认情况下，所有正规科目都会被跟踪，非学分科目除外。

|               跟踪前                |              添加跟踪              |
| :------------------------------------: | :-----------------------------------: |
| ![跟踪前](/images/track-before.png) | ![跟踪后](/images/track-after.png) |

## 搜索和筛选

可以在顶部搜索栏中按科目名称或标题进行搜索。

筛选选项：

- **按科目**: 仅显示特定科目
- **按状态**: 筛选已完成/未完成项目

应用筛选后会显示"已设置筛选"提示。

<img src="/images/filter.png" alt="筛选" style="max-width:320px;" />

## 隐藏任务

已确认或不需要的项目可以隐藏。

- **右键点击** 卡片 → 选择"隐藏此任务"
- 右键点击科目分组标题可以一次性隐藏该科目的所有项目。

隐藏的项目可以在设置标签页的"已隐藏任务"中查看和恢复。

|           隐藏            |            取消隐藏             |
| :-------------------------: | :--------------------------------: |
| ![隐藏](/images/hide.png) | ![取消隐藏](/images/unhide.png) |

## 课程页面状态徽章

在每门课程的页面中，活动（课程/作业/测验）旁边会显示状态徽章。

### 课程 (VOD)

<table>
  <thead><tr><th>徽章</th><th>状态</th><th>含义</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">出勤</span></td><td>出勤</td><td>已观看达到出勤要求时长</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #93c5fd 0%, #93c5fd 45%, #dbeafe 45%, #dbeafe 100%);color:#1e40af;border:1px solid #93c5fd;">观看中 · 11天后</span></td><td>观看中</td><td>部分观看（进度可视化）</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #fca5a5 0%, #fca5a5 45%, #fee2e2 45%, #fee2e2 100%);color:#b91c1c;border:1px solid #fca5a5;">观看中 · 23小时后</span></td><td>观看中（临近）</td><td>部分观看 + 距截止不到24小时</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">未观看 · 6天后</span></td><td>未观看</td><td>尚未观看</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">未观看 · 23小时后</span></td><td>未观看（临近）</td><td>距截止不到24小时</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">缺勤</span></td><td>缺勤</td><td>已过期</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">已隐藏</span></td><td>已隐藏</td><td>已隐藏的项目</td></tr>
  </tbody>
</table>

::: info 观看中徽章
观看中徽章基于进度页面的学习时间数据计算并显示进度。
:::

### 作业 / 测验

<div style="display:flex;gap:16px;flex-wrap:wrap;">
<div style="flex:1;min-width:280px;">

**作业**

<table>
  <thead><tr><th>徽章</th><th>含义</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">已提交</span></td><td>作业提交完成</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">未提交 · 6天后</span></td><td>距截止1天以上</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">未提交 · 23小时后</span></td><td>距截止不到24小时</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">未提交 (截止)</span></td><td>已过期</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">已隐藏</span></td><td>已隐藏的项目</td></tr>
  </tbody>
</table>

</div>
<div style="flex:1;min-width:280px;">

**测验**

<table>
  <thead><tr><th>徽章</th><th>含义</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">已参加</span></td><td>测验参加完成</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">未参加 · 6天后</span></td><td>距截止1天以上</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">未参加 · 23小时后</span></td><td>距截止不到24小时</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">未参加 (截止)</span></td><td>已过期</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">已隐藏</span></td><td>已隐藏的项目</td></tr>
  </tbody>
</table>

</div>
</div>

![课程页面](/images/page.png)

## 自动播放器

![播放器](/images/player.png)

::: info 智能播放
- 已出勤的课程会自动跳过。
- 如果有之前观看的位置，将从该位置继续播放。
:::

### 预计结束时间

播放中按钮上会显示剩余课程的预计结束时间。

### 更改播放顺序

可以在侧边栏的课程列表中通过拖放来更改播放顺序。

### 离开页面警告

自动播放中尝试离开页面时会显示警告。

## 刷新

<img src="/images/refresh.png" alt="刷新" style="max-width:320px;" />

可以通过下拉菜单中的刷新按钮更新数据。最后更新超过5分钟后会显示红点。超过1小时后数据将自动更新。

## 联系我们

<img src="/images/setting-tab.png" alt="刷新" style="max-width:320px;" />

可以在设置标签页底部通过电子邮件或 KakaoTalk 开放聊天进行咨询。
