import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from '@/styles/index.css?inline';
import { createShadowRoot } from '@/lib/createShadowRoot';
import { ShadowRootContext } from '@/lib/ShadowRootContext';
import { TooltipProvider } from '@/components/ui/tooltip';

const body = document.querySelector('#page-site-index');

if (body) {
  const top = document.getElementById('back-top');
  const host = document.createElement('div');
  host.id = 'extension-content-root';
  host.style.position = 'fixed';
  host.style.left = '0px';
  host.style.bottom = '108px';
  body.appendChild(host);

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
