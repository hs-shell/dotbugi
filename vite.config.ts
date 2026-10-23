import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { createManifest } from './manifest.config.ts';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    base: './',
    plugins: [
      react(),
      // dev 서버에서는 crx 플러그인을 제외 (mock 빌드에서는 포함)
      !isDev &&
        crx({
          manifest: createManifest(mode),
          contentScripts: {
            injectCss: true,
          },
        }),
    ].filter(Boolean), // undefined 제거
    resolve: {
      // Vite 8부터 tsconfig paths 해석이 내장되어 vite-tsconfig-paths 플러그인을 대체한다
      tsconfigPaths: true,
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        src: new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      // Vite 8(Rolldown)은 객체형 manualChunks를 지원하지 않으므로 codeSplitting.groups로
      // 기존과 같은 이름의 vendor 청크를 유지한다 (정규식은 Windows 경로 구분자도 허용)
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-radix',
                test: /node_modules[\\/]@radix-ui[\\/]react-(dropdown-menu|popover|select|tooltip|context-menu)[\\/]/,
              },
              // motion/react는 framer-motion 재수출 파일이라 실제 구현 패키지까지 매칭해야 청크가 생긴다
              {
                name: 'vendor-motion',
                test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/,
              },
              { name: 'vendor-i18n', test: /node_modules[\\/](i18next|react-i18next)[\\/]/ },
              { name: 'vendor-dnd', test: /node_modules[\\/]@dnd-kit[\\/](core|sortable)[\\/]/ },
            ],
          },
        },
      },
    },
  };
});
