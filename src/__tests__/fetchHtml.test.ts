import { describe, it, expect } from 'vitest';
import { getText, getHref } from '@/lib/fetchHtml';

function el(html: string): Element {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

describe('getText', () => {
  it('셀렉터로 텍스트 추출', () => {
    const parent = el('<span class="name">Hello</span>');
    expect(getText(parent, '.name')).toBe('Hello');
  });

  it('텍스트 앞뒤 공백 trim', () => {
    const parent = el('<span class="name">  Hello  </span>');
    expect(getText(parent, '.name')).toBe('Hello');
  });

  it('셀렉터가 매칭 안 되면 null', () => {
    const parent = el('<span>Hello</span>');
    expect(getText(parent, '.missing')).toBeNull();
  });

  it('빈 텍스트 요소는 falsy이므로 null', () => {
    const parent = el('<span class="name"></span>');
    expect(getText(parent, '.name')).toBeNull();
  });

  it('공백만 있는 텍스트는 trim 후 빈 문자열 → null', () => {
    const parent = el('<span class="name">   </span>');
    expect(getText(parent, '.name')).toBeNull();
  });

  it('중첩 요소의 텍스트도 포함', () => {
    const parent = el('<div class="wrap"><b>Bold</b> text</div>');
    expect(getText(parent, '.wrap')).toBe('Bold text');
  });

  it('여러 매칭 시 첫 번째 요소만 반환', () => {
    const parent = el('<span class="item">First</span><span class="item">Second</span>');
    expect(getText(parent, '.item')).toBe('First');
  });
});

describe('getHref', () => {
  it('a 태그의 href 추출', () => {
    const parent = el('<a class="link" href="https://example.com">Link</a>');
    const result = getHref(parent, '.link');
    expect(result).toContain('example.com');
  });

  it('셀렉터가 매칭 안 되면 null', () => {
    const parent = el('<span>No link</span>');
    expect(getHref(parent, 'a')).toBeNull();
  });

  it('href가 없는 a 태그는 빈 문자열 → falsy → null', () => {
    const parent = el('<a class="link">No href</a>');
    expect(getHref(parent, '.link')).toBeNull();
  });

  it('a가 아닌 요소에 href가 없으면 null', () => {
    const parent = el('<div class="link">Not a link</div>');
    expect(getHref(parent, '.link')).toBeNull();
  });

  it('상대 경로도 추출 (jsdom이 절대 경로로 변환할 수 있음)', () => {
    const parent = el('<a class="link" href="/path/to/page">Link</a>');
    const result = getHref(parent, '.link');
    expect(result).toBeTruthy();
    expect(result).toContain('/path/to/page');
  });
});
