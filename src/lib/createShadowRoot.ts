export function createShadowRoot(host: HTMLElement, styles: string[]): ShadowRoot {
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // host에 데이터 속성 추가
  host.dataset.shadowId = 'extension-content-root';

  const sheets = styles.map((styleString) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styleString);
    return sheet;
  });

  shadowRoot.adoptedStyleSheets = sheets;

  return shadowRoot;
}
