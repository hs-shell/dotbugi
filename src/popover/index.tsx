import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/i18n';
import Dashboard from './dashboard/Dashboard';
import styles from '@/styles/shadow.css?inline';
import { createShadowRoot } from '@/popover/lib/createShadowRoot';
import { ShadowRootContext } from '@/popover/lib/ShadowRootContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import PlayerApp from '@/popover/player/App';
import { injectCourseToggles } from '@/lib/injectCourseToggles';
import { injectCourseStatus } from '@/lib/courseStatus';

const HANSUNG_URL = 'https://learn.hansung.ac.kr/';
const footer = document.getElementById('page-footer');
const leftMenus = document.getElementsByClassName('left-menus');

const url = window.location.href;

if (footer && url === HANSUNG_URL) {
  injectCourseToggles();
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

  const shadowRoot = createShadowRoot(host, [styles], 'popover');

  createRoot(shadowRoot).render(
    <ShadowRootContext.Provider value={shadowRoot}>
      <React.StrictMode>
        <TooltipProvider>
          <Dashboard />
        </TooltipProvider>
      </React.StrictMode>
    </ShadowRootContext.Provider>
  );
}

// 강의 페이지에서 트래킹 상태 배지 주입
if (url.includes('/course/view.php?id=') && url.startsWith(HANSUNG_URL)) {
  injectCourseStatus();
}

if (leftMenus.length === 2 && url.startsWith(HANSUNG_URL)) {
  const leftMenu = leftMenus[0];

  const host = document.createElement('div');
  host.id = 'dotbugi-player';
  host.style.backgroundColor = 'transparent';
  leftMenu.append(host);

  const shadowRoot = createShadowRoot(host, [styles], 'player');

  createRoot(shadowRoot).render(
    <ShadowRootContext.Provider value={shadowRoot}>
      <React.StrictMode>
        <PlayerApp />
      </React.StrictMode>
    </ShadowRootContext.Provider>
  );
}
