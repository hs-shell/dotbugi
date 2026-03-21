# Basic User Guide

## Installation

1. Search for **HSU Dotbugi** on the Chrome Web Store.
2. Click the **Add to Chrome** button.
3. After installation, navigate to the university LMS (learn.hansung.ac.kr).

![Chrome Web Store](/images/web-store.png)

## First Launch

Once installed, a Dotbugi button will appear at the bottom-right of the LMS page. Click it to open the dashboard.

![Dashboard](/images/onboard.png)

## Dashboard

The dashboard consists of 3 tabs: **Online Lectures**, **Assignments**, and **Quizzes**.

Each card displays the course name, title, and deadline, with colors that change based on status.

<div style="display:flex;gap:16px;flex-wrap:wrap;">
<div style="flex:1;min-width:250px;">

**Online Lectures**

<table>
  <thead><tr><th>Badge</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">Attended</span></td><td>Watching completed</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #93c5fd 0%, #93c5fd 45%, #dbeafe 45%, #dbeafe 100%);color:#1e40af;border:1px solid #93c5fd;">Watching · In 11 days</span></td><td>Partially watched</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">Not Watched · In 6 days</span></td><td>Not watched</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">Absent</span></td><td>Past due</td></tr>
  </tbody>
</table>

</div>
<div style="flex:1;min-width:250px;">

**Assignments / Quizzes**

<table>
  <thead><tr><th>Badge</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">Submitted</span></td><td>Submitted/taken</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">Not Submitted · In 6 days</span></td><td>More than 1 day until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">Not Taken · In 23 hours</span></td><td>Less than 24 hours remaining</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">Not Submitted (Closed)</span></td><td>Past due</td></tr>
  </tbody>
</table>

</div>
</div>

Clicking a card navigates directly to the corresponding lecture/assignment/quiz page.

Data is automatically refreshed **every hour**, and also refreshes immediately when you return to the tab after more than an hour away. To refresh manually, click **⋮ Menu → Refresh** in the top-right corner. A red dot on the ⋮ button indicates the data is stale.

![Dashboard](/images/tasks.png)

## Auto-Play Player

The sidebar that appears on the left side of the course page lets you automatically play unwatched lectures in sequence.

1. Click the Dotbugi trigger on the left side of the course page.
2. Press the **Start Playing** button to begin auto-playing from the first unwatched lecture.
3. When all lectures are finished, it will be marked as "Completed".

::: tip Does this affect attendance recognition?
Dotbugi's auto-play works at **normal speed (1x) without any speed manipulation or video tampering**. It operates exactly the same as manually pressing the play button, so it fully meets the LMS attendance criteria (90% or more of playback time). It is fundamentally different from external speed-up programs, so you can use it with confidence.
:::

![Dashboard](/images/player.png)

## Change Language

You can choose from Korean, English, Chinese, or Japanese in the Settings tab.

|                                  |                                   |
| -------------------------------- | --------------------------------- |
| ![Dashboard](/images/setting.png) | ![Dashboard](/images/language.png) |
