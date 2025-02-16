import { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest = {
  manifest_version: 3,
  name: 'HSU 돋부기 🔎',
  version: '2.1.5',
  description: '한성대학교 LMS 강의, 과제, 퀴즈를 한 눈에!',
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
  permissions: ['storage', 'notifications', 'alarms'],
  host_permissions: ['https://*/*', 'http://*/*'],
} as ManifestV3Export;

export default manifest;
