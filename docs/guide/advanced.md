# 고급 사용 설명서

## 과목 트래킹 설정

LMS 메인 페이지의 각 과목 카드에 트래킹 토글 버튼이 표시됩니다.

- **파란색 체크**: 트래킹 중 — 대시보드에 할 일이 표시됩니다.
- **반투명**: 트래킹 해제 — 대시보드에서 숨겨집니다.

기본적으로 모든 정규 과목은 트래킹되며, 비교과 과목은 제외됩니다.

|               트래킹 전                |              트래킹 추가              |
| :------------------------------------: | :-----------------------------------: |
| ![트래킹 전](/images/track-before.png) | ![트래킹 후](/images/track-after.png) |

## 검색 및 필터

상단 검색창에서 과목명이나 제목으로 검색할 수 있습니다.

필터 옵션:

- **과목별**: 특정 과목만 표시
- **상태별**: 완료/미완료 항목 필터링

필터가 적용되면 "필터 설정됨" 표시가 나타납니다.

<img src="/images/filter.png" alt="필터" style="max-width:320px;" />

## 태스크 숨기기

이미 확인했거나 불필요한 항목은 숨길 수 있습니다.

- 카드를 **우클릭** → "이 태스크 숨기기" 선택
- 과목 그룹 헤더를 우클릭하면 해당 과목의 모든 항목을 한번에 숨길 수 있습니다.

숨긴 항목은 설정 탭의 "숨긴 태스크"에서 확인하고 복원할 수 있습니다.

|           숨기기            |            숨기기 해제             |
| :-------------------------: | :--------------------------------: |
| ![숨기기](/images/hide.png) | ![숨기기 해제](/images/unhide.png) |

## 강의 페이지 상태 배지

각 강의의 코스 페이지에서 활동(강의/과제/퀴즈) 옆에 상태 배지가 표시됩니다.

### 강의 (VOD)

<table>
  <thead><tr><th>배지</th><th>상태</th><th>의미</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">출석</span></td><td>출석</td><td>출석인정 요구시간 이상 시청 완료</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #93c5fd 0%, #93c5fd 45%, #dbeafe 45%, #dbeafe 100%);color:#1e40af;border:1px solid #93c5fd;">시청중 · 11일 후</span></td><td>시청중</td><td>일부 시청함 (진행률 시각화)</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #fca5a5 0%, #fca5a5 45%, #fee2e2 45%, #fee2e2 100%);color:#b91c1c;border:1px solid #fca5a5;">시청중 · 23시간 후</span></td><td>시청중 (임박)</td><td>일부 시청 + 마감까지 24시간 이내</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">미시청 · 6일 후</span></td><td>미시청</td><td>아직 시청하지 않음</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">미시청 · 23시간 후</span></td><td>미시청 (임박)</td><td>마감까지 24시간 이내</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">결석</span></td><td>결석</td><td>기한이 지남</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">숨김</span></td><td>숨김</td><td>숨김 처리된 항목</td></tr>
  </tbody>
</table>

::: info 시청중 배지
시청중 배지는 진도 페이지의 학습시간 데이터를 기반으로 진행률을 계산하여 표시합니다.
:::

### 과제 / 퀴즈

<div style="display:flex;gap:16px;flex-wrap:wrap;">
<div style="flex:1;min-width:280px;">

**과제**

<table>
  <thead><tr><th>배지</th><th>의미</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">제출완료</span></td><td>과제 제출 완료</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">미제출 · 6일 후</span></td><td>마감까지 1일 이상</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">미제출 · 23시간 후</span></td><td>마감까지 24시간 이내</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">미제출 (마감)</span></td><td>기한이 지남</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">숨김</span></td><td>숨김 처리된 항목</td></tr>
  </tbody>
</table>

</div>
<div style="flex:1;min-width:280px;">

**퀴즈**

<table>
  <thead><tr><th>배지</th><th>의미</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">응시완료</span></td><td>퀴즈 응시 완료</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">미응시 · 6일 후</span></td><td>마감까지 1일 이상</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">미응시 · 23시간 후</span></td><td>마감까지 24시간 이내</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">미응시 (마감)</span></td><td>기한이 지남</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#f3f4f6;color:#6b7280;border:1px solid #d1d5db;">숨김</span></td><td>숨김 처리된 항목</td></tr>
  </tbody>
</table>

</div>
</div>

![강의 페이지](/images/page.png)

## 자동 재생 플레이어

![플레이어](/images/player.png)

::: tip 배속 프로그램과의 차이점
돋부기의 자동 재생은 영상 속도를 변경하거나 재생 시간을 조작하지 않습니다. **원래 속도(1배속)로 정상 재생**하며, 단지 여러 강의를 사용자가 직접 클릭하지 않아도 연속으로 재생해주는 편의 기능입니다. LMS에 기록되는 재생시간과 학습시간이 동일하므로 출석 인정 기준에 전혀 영향을 주지 않습니다.
:::

::: info 스마트 재생
- 이미 출석 처리된 강의는 자동으로 건너뜁니다.
- 이전에 시청한 위치가 있으면 해당 지점부터 이어서 재생합니다.
:::

### 예상 종료 시간

재생 중 버튼에 남은 강의의 예상 종료 시간이 표시됩니다.

### 재생 순서 변경

사이드바의 강의 목록에서 드래그 앤 드롭으로 재생 순서를 바꿀 수 있습니다.

### 페이지 이탈 경고

자동 재생 중 페이지를 떠나려 하면 경고가 표시됩니다.

## 새로고침

<img src="/images/refresh.png" alt="새로고침" style="max-width:320px;" />

드롭다운 메뉴의 새로고침 버튼으로 데이터를 갱신할 수 있습니다. 마지막 갱신 후 5분이 지나면 빨간 점이 표시됩니다. 1시간이 지나면 자동으로 데이터가 갱신됩니다.

## 문의

<img src="/images/setting-tab.png" alt="새로고침" style="max-width:320px;" />

설정 탭 하단에서 이메일 또는 카카오톡 오픈채팅으로 문의할 수 있습니다.
