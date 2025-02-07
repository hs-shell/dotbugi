import { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest = {
  manifest_version: 3,
  name: 'dotbugi',
  version: '1.4.0',
  description: 'dotbugi',
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
      js: ['src/content/index.tsx'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['assets/*', 'assets/*.css', '*.webp', '*.png', '*.jpg', '*.jpeg', '*.gif'],
      matches: ['*://*/*'],
    },
  ],
  options_page: '/option.html',
  permissions: ['scripting', 'storage', 'activeTab', 'notifications', 'alarms'],
  host_permissions: ['https://*/*', 'http://*/*'],
} as ManifestV3Export;

export default manifest;
