import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '돋부기',
  base: '/dotbugi/',
  lang: 'ko-KR',
  description: 'dotbugi 사용 가이드 및 업데이트 내역',

  themeConfig: {
    nav: [
      { text: '가이드', link: '/guide/basic' },
      { text: '업데이트', link: '/updates/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '가이드',
          items: [
            { text: '간단 사용 설명서', link: '/guide/basic' },
            { text: '고급 사용 설명서', link: '/guide/advanced' },
            { text: 'Google 캘린더 연동', link: '/guide/calendar' },
          ],
        },
      ],
      '/updates/': [
        {
          text: '업데이트',
          items: [{ text: '업데이트 로그', link: '/updates/changelog' }],
        },
      ],
    },

    outline: { label: '목차' },
    docFooter: { prev: '이전', next: '다음' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/hs-shell/dotbugi' }],
  },
});
