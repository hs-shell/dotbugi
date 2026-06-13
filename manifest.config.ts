import { ManifestV3Export } from '@crxjs/vite-plugin';
import packageJson from './package.json' with { type: 'json' };

const PROD_CLIENT_ID = '804067218183-3pev3tppten6i94lrfvmk729hmbdejqb.apps.googleusercontent.com';
const DEV_CLIENT_ID = '981860765955-t69elhj8osi7vdp84m5bf8b9hdib44kr.apps.googleusercontent.com';

export function createManifest(mode?: string): ManifestV3Export {
  const clientId = mode === 'mock' ? DEV_CLIENT_ID : PROD_CLIENT_ID;

  // 베타 채널 빌드 기반 (Chrome Web Store 2단계 게시 대비)
  // 릴리즈 워크플로의 베타 빌드에서 RELEASE_CHANNEL=beta 를 주입하면
  // 별도 스토어 항목/아이콘과 구분되도록 이름에 (Beta) 가 붙는다.
  const isBeta = process.env.RELEASE_CHANNEL === 'beta';

  return {
    manifest_version: 3,
    name: isBeta ? '__MSG_extName__ (Beta)' : '__MSG_extName__',
    version: packageJson.version,
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
    permissions: ['storage', 'identity'],
    host_permissions: ['https://*/*', 'http://*/*'],
    oauth2: {
      client_id: clientId,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    },
  };
}
