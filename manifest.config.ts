import { ManifestV3Export } from '@crxjs/vite-plugin';
import packageJson from './package.json' with { type: 'json' };

const PROD_CLIENT_ID = '804067218183-3pev3tppten6i94lrfvmk729hmbdejqb.apps.googleusercontent.com';
const DEV_CLIENT_ID = '981860765955-t69elhj8osi7vdp84m5bf8b9hdib44kr.apps.googleusercontent.com';
// 베타는 별도 스토어 항목 = 별도 확장 ID로 게시되므로, 그 확장 ID에 묶인
// 전용 OAuth client_id 가 필요하다. (스테이블용 PROD_CLIENT_ID 로는 베타에서
// chrome.identity 토큰 검증이 실패한다.)
const BETA_CLIENT_ID = '804067218183-svupooi4prp03er11902envfmmrbubta.apps.googleusercontent.com';

// 스토어 항목의 공개 키. 압축해제로 로드한 로컬 빌드는 확장 ID 가 폴더 경로로 정해져 OAuth 가 거부되는데,
// manifest 에 이 키를 넣으면 스토어와 같은 확장 ID 가 되어 캘린더 연동을 로컬에서 테스트할 수 있다.
// 공개 키라 비밀이 아니다(서명용 개인 키는 스토어만 보유). 스토어는 key 가 든 업로드를 거부하므로
// 로컬 테스트 빌드(--mode localtest)에서만 넣고, 릴리즈 워크플로가 산출물에 key 가 없는지 검사한다.
const STABLE_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5/Q3Kyc12e35gmWbR+rL46jV5NPJbNUgFpznCs9gV0Iq2N6Ep42y5wEauRvNtQFPvfbANR7aQZjWZ7I3xntagroCGxHoLMZYrCARn5uQST5QoFC8q1QFiPPEHER/RRbSTKkhgK4QJ0GdUIM5q/NXY5Az6wPdU2/F5uIgRu3OGF0L8ytCZtjOmISNnhasGPwh5vAg+SxdI2sZPUylLrzUWKbMHJ8soS/tmJjESqXe4eKQkMmjX5/ymvvOnT6z6bSOhLk/oilmW9q66GOCNGsQ+tUudPIAUJOOeDFwWdFrAK4Avyd5ctAbiQzCtHxZoAAsDuiKIfX4ocYj/WnGCoDgvQIDAQAB';
const BETA_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwZ1KR31Xwm1kv2/Z2/MBGd93rExaV/0aAPrvJQGFrQbYVwn1Ynm+NECzTXzNcn9pmq2twBkTE46oPr1g4NoHUlJ2pMfHFrXgT+wHaT0X1bvXEJ7VGnt2sSI8ToSOyuKHg7b/+Lyhd2YuGfLRrGP52bXUX5RtjJ1lNRKn5A9lLYjgJaOzVmg9M81TLuIu7wujGFeho71zEoZoNQs3GWax1kNiAsGZwfsLlpjKUl8xG/Pv5JJ1LDpR/3g0qKfkAjwlsVawx96t27NH23YIUYqubxbYtXkyiAFOr7zu4DTyAGz4/bAj4f7PdeAQEVuQtlKaAV08s32Hch4/3U2OC22QIwIDAQAB';

// Vite 는 'local' 을 모드 이름으로 쓸 수 없어(.env.local 과 충돌) 별도 이름을 쓴다.
export const LOCAL_MODE = 'localtest';

export function createManifest(mode?: string): ManifestV3Export {
  // 베타 채널 빌드 (Chrome Web Store 별도 항목 게시 대비)
  // 릴리즈 워크플로의 베타 빌드에서 RELEASE_CHANNEL=beta 를 주입하면
  // 이름에 (Beta) 가 붙고, 별도 아이콘/OAuth client_id 로 분기된다.
  const isBeta = process.env.RELEASE_CHANNEL === 'beta';
  // 로컬 테스트 빌드: 스토어(베타면 베타 항목)와 같은 확장 ID + 초록색 DEV 아이콘·이름으로 구분
  const isLocal = mode === LOCAL_MODE;

  // 베타 빌드는 스토어 게시 여부와 무관하게 프리릴리즈 zip으로 배포되므로,
  // client_id 가 비어 있으면 Calendar 연동이 깨진 산출물이 나간다 → 빌드 단계에서 막는다.
  if (isBeta && mode !== 'mock' && !BETA_CLIENT_ID) {
    throw new Error('BETA_CLIENT_ID 가 비어 있습니다. 베타용 OAuth client_id 발급 후 설정하세요. (#112)');
  }

  const clientId = mode === 'mock' ? DEV_CLIENT_ID : isBeta ? BETA_CLIENT_ID : PROD_CLIENT_ID;
  const iconPrefix = isLocal ? 'icon-dev' : isBeta ? 'icon-beta' : 'icon';

  // Chrome manifest version 은 숫자 점 표기만 허용하므로 `-beta.N` 을 못 쓴다.
  // 베타 워크플로는 BETA_VERSION 으로 4-파트 숫자(X.Y.Z.RUN_NUMBER)를 주입한다.
  const version = isBeta && process.env.BETA_VERSION ? process.env.BETA_VERSION : packageJson.version;

  return {
    manifest_version: 3,
    // Chrome은 값 전체가 __MSG_키__ 하나일 때만 치환하므로 접미사를 붙이지 말고 별도 키를 쓴다
    name: isLocal ? '__MSG_extNameDev__' : isBeta ? '__MSG_extNameBeta__' : '__MSG_extName__',
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
    // dotbugi-mcp 연결(#167): 선택 권한이라 기존 사용자 업데이트 시 비활성화되지 않는다.
    // 지금은 위 http://*/* 가 이미 포함하지만, host 권한을 좁혀도 연결이 유지되도록 명시해 둔다.
    optional_host_permissions: ['http://127.0.0.1/*'],
    oauth2: {
      client_id: clientId,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    },
    ...(isLocal && { key: isBeta ? BETA_PUBLIC_KEY : STABLE_PUBLIC_KEY }),
  };
}
