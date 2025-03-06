import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from '@/styles/shadow.css?inline';
import { createShadowRoot } from '@/lib/createShadowRoot';
import { ShadowRootContext } from '@/lib/ShadowRootContext';
import { TooltipProvider } from '@/components/ui/tooltip';

const footer = document.getElementById('page-footer');
const url = window.location.href;
if (footer && url === 'https://learn.hansung.ac.kr/') {
  const backtop = document.getElementById('back-top') as HTMLDivElement;
  if (backtop) backtop.remove();

  footer.style.paddingBottom = '24px';

  const placeholder = document.createElement('div');
  placeholder.id = 'footer-placeholder';
  placeholder.style.display = 'block';
  placeholder.style.position = 'relative';
  placeholder.style.bottom = '8px';
  placeholder.style.zIndex = '10';
  placeholder.style.height = '80px';
  placeholder.style.backgroundColor = 'transparent';
  footer.prepend(placeholder);

  const host = document.createElement('div');
  host.id = 'extension-content-root';
  host.style.display = 'block';
  host.style.position = 'relative';
  host.style.bottom = '8px';
  host.style.zIndex = '100';
  host.style.backgroundColor = 'transparent';
  placeholder.append(host);

  const shadowRoot = createShadowRoot(host, [styles]);

  createRoot(shadowRoot).render(
    <ShadowRootContext.Provider value={shadowRoot}>
      <React.StrictMode>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </React.StrictMode>
    </ShadowRootContext.Provider>
  );
}
