export function createShadowRoot(host: HTMLElement, styles: string[], shadowId: string): ShadowRoot {
  const shadowRoot = host.attachShadow({ mode: 'open' });

  host.dataset.shadowId = shadowId;

  const sheets = styles.map((styleString) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styleString);
    return sheet;
  });

  shadowRoot.adoptedStyleSheets = sheets;

  return shadowRoot;
}
