import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
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
        '@': path.resolve(__dirname, './src'),
        src: path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  };
});
