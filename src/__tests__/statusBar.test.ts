import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { hideStatusBar, showStatusBar } from '@/lib/courseStatus/statusBar';

const getBar = () => document.getElementById('dotbugi-status-bar') as HTMLElement | null;
const getNavbar = () => document.querySelector('.navbar-fixed-top') as HTMLElement;

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<nav class="navbar-fixed-top"></nav>';
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('showStatusBar', () => {
  it('로딩 중에는 막대를 보이고 상단 내비게이션을 아래로 밀며, 자동으로 숨기지 않는다', () => {
    showStatusBar('loading');
    expect(getBar()!.textContent).toBe('courseStatus.bar.loading');
    expect(getBar()!.style.opacity).toBe('1');
    expect(getNavbar().style.top).toBe('36px');

    vi.advanceTimersByTime(5000);
    expect(getBar()!.style.opacity).toBe('1');
  });

  it('성공·오류는 같은 막대를 재사용하고 2초 뒤 숨기며 내비게이션을 되돌린다', () => {
    showStatusBar('loading');
    showStatusBar('success');
    expect(document.querySelectorAll('#dotbugi-status-bar')).toHaveLength(1);
    expect(getBar()!.textContent).toBe('courseStatus.bar.success');

    vi.advanceTimersByTime(2000);
    expect(getBar()!.style.opacity).toBe('0');
    expect(getBar()!.style.height).toBe('0px');
    expect(getNavbar().style.top).toBe('0px');
  });
});

describe('hideStatusBar', () => {
  it('막대가 없으면 아무것도 하지 않는다', () => {
    hideStatusBar();
    expect(getBar()).toBeNull();
    expect(getNavbar().style.top).toBe('');
  });
});
