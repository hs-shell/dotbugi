import { defineConfig, type DefaultTheme } from 'vitepress';

function guideSidebar(basic: string, advanced: string, calendar: string, faq: string, label: string, prefix = ''): DefaultTheme.SidebarItem[] {
  return [{ text: label, items: [
    { text: basic, link: `${prefix}/guide/basic` },
    { text: advanced, link: `${prefix}/guide/advanced` },
    { text: calendar, link: `${prefix}/guide/calendar` },
    { text: faq, link: `${prefix}/guide/faq` },
  ]}];
}

function updatesSidebar(label: string, changelog: string, prefix = ''): DefaultTheme.SidebarItem[] {
  return [{ text: label, items: [{ text: changelog, link: `${prefix}/updates/changelog` }] }];
}

export default defineConfig({
  title: '돋부기',
  base: '/dotbugi/',
  description: 'dotbugi 사용 가이드 및 업데이트 내역',

  head: [
    ['link', { rel: 'icon', href: '/dotbugi/favicon.png', type: 'image/png' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-jp.min.css' }],
  ],

  locales: {
    root: {
      label: '한국어',
      lang: 'ko-KR',
      themeConfig: {
        nav: [
          { text: '가이드', link: '/guide/basic' },
          { text: '업데이트', link: '/updates/changelog' },
        ],
        sidebar: {
          '/guide/': guideSidebar('간단 사용 설명서', '고급 사용 설명서', 'Google 캘린더 연동', 'FAQ', '가이드'),
          '/updates/': updatesSidebar('업데이트', '업데이트 로그'),
        },
        outline: { label: '목차' },
        docFooter: { prev: '이전', next: '다음' },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/basic' },
          { text: 'Updates', link: '/en/updates/changelog' },
        ],
        sidebar: {
          '/en/guide/': guideSidebar('Quick Start', 'Advanced Guide', 'Google Calendar', 'FAQ', 'Guide', '/en'),
          '/en/updates/': updatesSidebar('Updates', 'Changelog', '/en'),
        },
        outline: { label: 'On this page' },
        docFooter: { prev: 'Previous', next: 'Next' },
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      themeConfig: {
        nav: [
          { text: 'ガイド', link: '/ja/guide/basic' },
          { text: '更新履歴', link: '/ja/updates/changelog' },
        ],
        sidebar: {
          '/ja/guide/': guideSidebar('簡単ガイド', '詳細ガイド', 'Google カレンダー連携', 'よくある質問', 'ガイド', '/ja'),
          '/ja/updates/': updatesSidebar('更新履歴', '更新ログ', '/ja'),
        },
        outline: { label: '目次' },
        docFooter: { prev: '前へ', next: '次へ' },
      },
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/basic' },
          { text: '更新日志', link: '/zh/updates/changelog' },
        ],
        sidebar: {
          '/zh/guide/': guideSidebar('快速入门', '高级指南', 'Google 日历', '常见问题', '指南', '/zh'),
          '/zh/updates/': updatesSidebar('更新日志', '更新记录', '/zh'),
        },
        outline: { label: '目录' },
        docFooter: { prev: '上一页', next: '下一页' },
      },
    },
  },

  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/hs-shell/dotbugi' }],
  },
});
