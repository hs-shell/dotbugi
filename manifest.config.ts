import { ManifestV3Export } from '@crxjs/vite-plugin';

const PROD_CLIENT_ID = '804067218183-3pev3tppten6i94lrfvmk729hmbdejqb.apps.googleusercontent.com';
const DEV_CLIENT_ID = '981860765955-t69elhj8osi7vdp84m5bf8b9hdib44kr.apps.googleusercontent.com';

export function createManifest(mode?: string): ManifestV3Export {
  const clientId = mode === 'mock' ? DEV_CLIENT_ID : PROD_CLIENT_ID;

  return {
  manifest_version: 3,
  name: '__MSG_extName__',
  version: '4.0.5',
  description: '__MSG_extDescription__',
  default_locale: 'ko',
  action: {},
  icons: {
    '16': 'images/icon/icon-16.png',
    '32': 'images/icon/icon-32.png',
    '48': 'images/icon/icon-48.png',
    '128': 'images/icon/icon-128.png',
  },
  background: {
    service_worker: 'src/background.ts',
  },
  content_scripts: [
    {
      matches: ['https://learn.hansung.ac.kr/**'],
      js: ['src/popover/index.tsx'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['assets/*', 'assets/*.css', '*.webp', '*.png', '*.jpg', '*.jpeg', '*.gif'],
      matches: ['*://*/*'],
    },
  ],
  permissions: ['storage', 'notifications', 'alarms', 'identity'],
  host_permissions: ['https://*/*', 'http://*/*'],
  oauth2: {
    client_id: clientId,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  },
  };
}
