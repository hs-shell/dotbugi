# 간단 사용 설명서

## 설치

1. Chrome 웹스토어에서 **HSU 돋부기**를 검색합니다.
2. **Chrome에 추가** 버튼을 클릭합니다.
3. 설치 완료 후, 학교 LMS(learn.hansung.ac.kr)에 접속합니다.

![크롬 웹스토어](/images/web-store.png)

## 첫 실행

설치가 완료되면 LMS 페이지 우측 하단에 돋부기 버튼이 나타납니다. 클릭하면 대시보드가 열립니다.

![대시보드](/images/onboard.png)

## 대시보드

대시보드는 **온라인 강의**, **과제**, **퀴즈** 3개 탭으로 구성됩니다.

각 카드에는 과목명, 제목, 마감일이 표시되며 상태에 따라 색상이 달라집니다.

<div style="display:flex;gap:16px;flex-wrap:wrap;">
<div style="flex:1;min-width:250px;">

**온라인 강의**

<table>
  <thead><tr><th>배지</th><th>의미</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">출석</span></td><td>시청 완료</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:linear-gradient(to right, #93c5fd 0%, #93c5fd 45%, #dbeafe 45%, #dbeafe 100%);color:#1e40af;border:1px solid #93c5fd;">시청중 · 11일 후</span></td><td>일부 시청함</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">미시청 · 6일 후</span></td><td>미시청</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">결석</span></td><td>기한 지남</td></tr>
  </tbody>
</table>

</div>
<div style="flex:1;min-width:250px;">

**과제 / 퀴즈**

<table>
  <thead><tr><th>배지</th><th>의미</th></tr></thead>
  <tbody>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#dcfce7;color:#166534;border:1px solid #86efac;">제출완료</span></td><td>제출/응시 완료</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;">미제출 · 6일 후</span></td><td>마감 1일 이상</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">미응시 · 23시간 후</span></td><td>24시간 이내</td></tr>
    <tr><td><span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;line-height:1.4;background:#450a0a;color:#fecaca;border:1px solid #7f1d1d;">미제출 (마감)</span></td><td>기한 지남</td></tr>
  </tbody>
</table>

</div>
</div>

카드를 클릭하면 해당 강의/과제/퀴즈 페이지로 바로 이동합니다.

데이터는 **1시간마다** 자동으로 갱신되며, 브라우저 탭을 벗어났다가 돌아왔을 때도 1시간이 지났으면 즉시 갱신됩니다. 바로 갱신하고 싶다면 우측 상단 **⋮ 메뉴 → 새로고침**을 클릭하세요. ⋮ 버튼에 빨간 점이 보이면 데이터가 오래되었다는 뜻입니다.

![대시보드](/images/tasks.png)

## 자동 재생 플레이어

강의 페이지 좌측에 나타나는 사이드바에서 미수강 강의를 자동으로 연속 재생할 수 있습니다.

1. 강의 페이지에서 좌측의 돋부기 트리거를 클릭합니다.
2. **수강 시작** 버튼을 누르면 첫 번째 미수강 강의부터 자동 재생됩니다.
3. 모든 강의가 끝나면 "수강 완료"로 표시됩니다.

::: tip 출석 인정에 영향이 없나요?
돋부기의 자동 재생은 **배속이나 영상 조작 없이 원래 속도(1배속)로 재생**합니다. 사용자가 직접 재생 버튼을 누르는 것과 동일하게 동작하므로, LMS의 출석 인정 기준(재생시간 90% 이상)을 정상적으로 충족합니다. 외부 배속 프로그램과는 근본적으로 다르니 안심하고 사용하세요.
:::

![대시보드](/images/player.png)

## 언어 변경

설정 탭에서 한국어, English, 中文, 日本語 중 선택할 수 있습니다.

|                                  |                                   |
| -------------------------------- | --------------------------------- |
| ![대시보드](/images/setting.png) | ![대시보드](/images/language.png) |
