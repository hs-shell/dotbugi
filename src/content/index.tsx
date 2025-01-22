import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styles from '@/styles/index.css?inline';
import { createShadowRoot } from '@/lib/createShadowRoot';
import { ShadowRootContext } from '@/lib/ShadowRootContext';

const body = document.querySelector('#page-site-index');

if (body) {
  const host = document.createElement('div');
  host.id = 'extension-content-root';
  host.style.position = 'fixed';
  host.style.right = '98px';
  host.style.bottom = '108px';
  body.appendChild(host);

  const shadowRoot = createShadowRoot(host, [styles]);

  createRoot(shadowRoot).render(
    <ShadowRootContext.Provider value={shadowRoot}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ShadowRootContext.Provider>
  );
}
