import { ManifestV3Export } from '@crxjs/vite-plugin';
import packageJson from './package.json' with { type: 'json' };

const PROD_CLIENT_ID = '804067218183-3pev3tppten6i94lrfvmk729hmbdejqb.apps.googleusercontent.com';
const DEV_CLIENT_ID = '981860765955-t69elhj8osi7vdp84m5bf8b9hdib44kr.apps.googleusercontent.com';
// 베타는 별도 스토어 항목 = 별도 확장 ID로 게시되므로, 그 확장 ID에 묶인
// 전용 OAuth client_id 가 필요하다. (스테이블용 PROD_CLIENT_ID 로는 베타에서
// chrome.identity 토큰 검증이 실패한다.)
// TODO(#112): 베타 스토어 항목 생성 후 발급받은 client_id 로 교체.
const BETA_CLIENT_ID = '';

export function createManifest(mode?: string): ManifestV3Export {
  // 베타 채널 빌드 (Chrome Web Store 별도 항목 게시 대비)
  // 릴리즈 워크플로의 베타 빌드에서 RELEASE_CHANNEL=beta 를 주입하면
  // 이름에 (Beta) 가 붙고, 별도 아이콘/OAuth client_id 로 분기된다.
  const isBeta = process.env.RELEASE_CHANNEL === 'beta';

  const clientId = mode === 'mock' ? DEV_CLIENT_ID : isBeta ? BETA_CLIENT_ID : PROD_CLIENT_ID;
  const iconPrefix = isBeta ? 'icon-beta' : 'icon';

  // Chrome manifest version 은 숫자 점 표기만 허용하므로 `-beta.N` 을 못 쓴다.
  // 베타 워크플로는 BETA_VERSION 으로 4-파트 숫자(X.Y.Z.RUN_NUMBER)를 주입한다.
  const version = isBeta && process.env.BETA_VERSION ? process.env.BETA_VERSION : packageJson.version;

  return {
    manifest_version: 3,
    name: isBeta ? '__MSG_extName__ (Beta)' : '__MSG_extName__',
    version,
    description: '__MSG_extDescription__',
    default_locale: 'ko',
    action: {},
    icons: {
      '16': `images/icon/${iconPrefix}-16.png`,
      '32': `images/icon/${iconPrefix}-32.png`,
      '48': `images/icon/${iconPrefix}-48.png`,
      '128': `images/icon/${iconPrefix}-128.png`,
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
