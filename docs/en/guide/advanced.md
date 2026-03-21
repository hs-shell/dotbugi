# Advanced User Guide

## Course Tracking Settings

A tracking toggle button is displayed on each course card on the LMS main page.

- **Blue check**: Tracking enabled — tasks will appear on the dashboard.
- **Transparent**: Tracking disabled — hidden from the dashboard.

By default, all regular courses are tracked, and extracurricular courses are excluded.

|               Before Tracking                |              After Adding Tracking              |
| :------------------------------------------: | :---------------------------------------------: |
| ![Before Tracking](/images/track-before.png) | ![After Tracking](/images/track-after.png) |

## Search and Filter

You can search by course name or title using the search bar at the top.

Filter options:

- **By course**: Show only specific courses
- **By status**: Filter completed/incomplete items

When a filter is applied, a "Filter applied" indicator appears.

<img src="/images/filter.png" alt="Filter" style="max-width:320px;" />

## Hiding Tasks

You can hide items that you have already checked or no longer need.

- **Right-click** a card → Select "Hide this task"
- Right-click a course group header to hide all items for that course at once.

Hidden items can be viewed and restored in the "Hidden Tasks" section of the Settings tab.

|           Hide            |            Unhide             |
| :-----------------------: | :---------------------------: |
| ![Hide](/images/hide.png) | ![Unhide](/images/unhide.png) |

## Course Page Status Badges

Status badges are displayed next to activities (lectures/assignments/quizzes) on each course page.

### Lectures (VOD)

<table>
  <thead><tr><th>Badge</th><th>Status</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">Attended</span></td><td>Attended</td><td>Watched for the required attendance time or more</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #93c5fd 0%, #93c5fd 45%, #dbeafe 45%, #dbeafe 100%);color:#1e40af;border:1px solid #93c5fd;">Watching · In 11 days</span></td><td>Watching</td><td>Partially watched (progress visualized)</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #fca5a5 0%, #fca5a5 45%, #fee2e2 45%, #fee2e2 100%);color:#b91c1c;border:1px solid #fca5a5;">Watching · In 23 hours</span></td><td>Watching (urgent)</td><td>Partially watched + less than 24 hours until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">Not Watched · In 6 days</span></td><td>Not Watched</td><td>Not yet watched</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">Not Watched · In 23 hours</span></td><td>Not Watched (urgent)</td><td>Less than 24 hours until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">Absent</span></td><td>Absent</td><td>Past due</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">Hidden</span></td><td>Hidden</td><td>Item has been hidden</td></tr>
  </tbody>
</table>

::: info Watching Badge
The watching badge calculates and displays progress based on the study time data from the progress page.
:::

### Assignments / Quizzes

<div style="display:flex;gap:16px;flex-wrap:wrap;">
<div style="flex:1;min-width:280px;">

**Assignments**

<table>
  <thead><tr><th>Badge</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">Submitted</span></td><td>Assignment submitted</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">Not Submitted · In 6 days</span></td><td>More than 1 day until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">Not Submitted · In 23 hours</span></td><td>Less than 24 hours until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">Not Submitted (Closed)</span></td><td>Past due</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">Hidden</span></td><td>Item has been hidden</td></tr>
  </tbody>
</table>

</div>
<div style="flex:1;min-width:280px;">

**Quizzes**

<table>
  <thead><tr><th>Badge</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">Taken</span></td><td>Quiz completed</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">Not Taken · In 6 days</span></td><td>More than 1 day until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">Not Taken · In 23 hours</span></td><td>Less than 24 hours until deadline</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">Not Taken (Closed)</span></td><td>Past due</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">Hidden</span></td><td>Item has been hidden</td></tr>
  </tbody>
</table>

</div>
</div>

![Course Page](/images/page.png)

## Auto-Play Player

![Player](/images/player.png)

::: tip How is this different from speed-up programs?
Dotbugi's auto-play does not change video speed or manipulate playback time. It **plays at normal speed (1x)** and simply provides the convenience of playing multiple lectures in sequence without manual clicks. Since the playback time and study time recorded in the LMS are identical, it has no impact on attendance criteria.
:::

::: info Smart Playback
- Lectures already marked as attended are automatically skipped.
- If there is a previous watch position, playback resumes from that point.
:::

### Estimated End Time

During playback, the estimated end time for the remaining lectures is displayed on the button.

### Changing Playback Order

You can change the playback order by dragging and dropping lectures in the sidebar list.

### Page Leave Warning

A warning is displayed when you try to leave the page during auto-playback.

## Refresh

<img src="/images/refresh.png" alt="Refresh" style="max-width:320px;" />

You can refresh the data using the refresh button in the dropdown menu. A red dot appears when 5 minutes have passed since the last refresh. Data is automatically refreshed after 1 hour.

## Contact

<img src="/images/setting-tab.png" alt="Settings" style="max-width:320px;" />

You can contact us via email or KakaoTalk open chat at the bottom of the Settings tab.
