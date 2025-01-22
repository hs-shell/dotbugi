import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { defineConfig } from 'vite';

import manifest from './public/manifest.config';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tsconfigPaths(),
    /**
     * npm run dev 시 주석 처리 해주세요
     */
    crx({
      manifest,
      contentScripts: {
        injectCss: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
        options: 'options.html', // 옵션 페이지 추가
      },
    },
  },
});
