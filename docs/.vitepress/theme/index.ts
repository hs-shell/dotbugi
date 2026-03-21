import DefaultTheme from 'vitepress/theme';
import AnnouncementBar from './AnnouncementBar.vue';
import { h } from 'vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(AnnouncementBar),
    });
  },
};
