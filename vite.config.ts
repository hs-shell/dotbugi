import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

import { createManifest } from './manifest.config';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    base: './',
    plugins: [
      react(),
      tsconfigPaths(),
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
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        src: new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-radix': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-toast',
            ],
            'vendor-motion': ['motion'],
            'vendor-i18n': ['i18next', 'react-i18next'],
            'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
          },
        },
      },
    },
  };
});
