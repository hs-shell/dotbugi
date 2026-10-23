import { beforeEach, describe, expect, it, vi } from 'vitest';

import { injectDownloadButtons } from '@/lib/courseStatus/injectDownloadButtons';
import { openSavedLocation, runVodDownload } from '@/lib/vodDownload/controller';

// 언어 전환을 흉내 내려고 현재 언어를 키 앞에 붙인다
const i18nState = vi.hoisted(() => ({ lang: 'ko', handlers: [] as (() => void)[] }));
vi.mock('@/i18n', () => ({
  default: {
    t: (key: string) => `${i18nState.lang}:${key}`,
    on: (_event: string, handler: () => void) => i18nState.handlers.push(handler),
  },
}));

const savedState = vi.hoisted(() => ({ cmids: new Set<string>() }));
vi.mock('@/lib/vodDownload/controller', () => ({
  runVodDownload: vi.fn().mockResolvedValue('dismissed'),
  cancelVodDownload: vi.fn(),
  openSavedLocation: vi.fn(),
  getActiveVodDownload: () => null,
  getSavedCmids: () => savedState.cmids,
  subscribeVodDownload: () => () => {},
}));

const HOST = '[data-dotbugi-download]';

// 강의 페이지 축약본: 1주차에 VOD 2개 + 과제 1개, 2주차에 숨김(dimmed) VOD 1개
const COURSE_PAGE = `
<ul>
  <li id="section-1">
    <h3 class="sectionname"><span>1주차 [3월 2일 - 3월 8일]</span><span data-dotbugi-current-week>현재 주차</span></h3>
    <ul>
      <li class="activity modtype_vod">
        <div class="activityinstance">
          <a href="https://learn.hansung.ac.kr/mod/vod/view.php?id=101"><span class="instancename">배열 / 리스트<span class="accesshide"> 동영상</span><span data-dotbugi-status>미시청</span></span></a>
        </div>
      </li>
      <li class="activity modtype_assign">
        <div class="activityinstance">
          <a href="https://learn.hansung.ac.kr/mod/assign/view.php?id=102"><span class="instancename">과제 1</span></a>
        </div>
      </li>
      <li class="activity modtype_vod">
        <div class="activityinstance">
          <a href="https://learn.hansung.ac.kr/mod/vod/view.php?id=103"><span class="instancename">연결 리스트</span></a>
        </div>
      </li>
    </ul>
  </li>
  <li id="section-2">
    <h3 class="sectionname"><span>2주차</span></h3>
    <ul>
      <li class="activity modtype_vod dimmed">
        <div class="activityinstance">
          <a href="https://learn.hansung.ac.kr/mod/vod/view.php?id=201"><span class="instancename">숨김 강의</span></a>
        </div>
      </li>
    </ul>
  </li>
</ul>`;

describe('injectDownloadButtons', () => {
  beforeEach(() => {
    document.body.innerHTML = COURSE_PAGE;
    i18nState.lang = 'ko';
    savedState.cmids = new Set();
    vi.mocked(runVodDownload).mockClear();
  });

  it('VOD 활동에만, 링크 바로 뒤에 붙인다 (과제·숨김 VOD 제외)', () => {
    injectDownloadButtons('자료구조');

    const hosts = Array.from(document.querySelectorAll(HOST));
    expect(hosts.map((h) => h.getAttribute('data-dotbugi-download'))).toEqual(['101', '103']);
    for (const host of hosts) expect(host.previousElementSibling?.tagName).toBe('A');
  });

  it('다시 불러도 중복되지 않는다', () => {
    injectDownloadButtons('자료구조');
    injectDownloadButtons('자료구조');

    expect(document.querySelectorAll(HOST)).toHaveLength(2);
  });

  it('클릭은 링크 이동으로 번지지 않고 과목-주차-강의명 파일명으로 다운로드를 시작한다', () => {
    injectDownloadButtons('자료구조');
    const host = document.querySelector(HOST) as HTMLElement;
    const parentClick = vi.fn();
    host.parentElement?.addEventListener('click', parentClick);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    host.shadowRoot?.querySelector('button')?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(parentClick).not.toHaveBeenCalled();
    expect(runVodDownload).toHaveBeenCalledWith(
      'https://learn.hansung.ac.kr/mod/vod/view.php?id=101',
      '자료구조-1주차 [3월 2일 - 3월 8일]-배열 _ 리스트.mp4',
      expect.any(Function)
    );
  });

  it('저장된 언어가 나중에 적용되면 라벨을 다시 단다', () => {
    injectDownloadButtons('자료구조');
    const button = document.querySelector(HOST)?.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('ko:vodDownload.button');
    expect(button?.hasAttribute('title')).toBe(false);

    i18nState.lang = 'en';
    i18nState.handlers.forEach((handler) => handler());

    expect(button?.getAttribute('aria-label')).toBe('en:vodDownload.button');
  });

  it('이번 페이지에서 받은 강의는 폴더 버튼만 보이고 누르면 저장 위치를 연다', () => {
    savedState.cmids = new Set(['103']);
    injectDownloadButtons('자료구조');

    const [first, second] = Array.from(document.querySelectorAll(HOST)).map((h) => h.shadowRoot);
    expect(first?.querySelector<HTMLButtonElement>('.folder')?.hidden).toBe(true);
    expect(first?.querySelector<HTMLButtonElement>('.start')?.hidden).toBe(false);

    const folder = second?.querySelector<HTMLButtonElement>('.folder');
    expect(folder?.hidden).toBe(false);
    expect(second?.querySelector<HTMLButtonElement>('.start')?.hidden).toBe(true);
    expect(folder?.getAttribute('aria-label')).toBe('ko:vodDownload.openLocation');

    folder?.click();
    expect(openSavedLocation).toHaveBeenCalledWith('https://learn.hansung.ac.kr/mod/vod/view.php?id=103');
  });
});
