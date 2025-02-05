import { SettingsIcon } from './icons/SettingsIcon';
import { Home, NotebookText, Video, Zap } from 'lucide-react';

export const data = [
  {
    title: 'Home',
    icon: <Home />,
    link: '/',
  },
  {
    title: '강의',
    icon: <Video />,
    link: '/vod/',
  },
  {
    title: '과제',
    icon: <NotebookText />,
    link: '/assignment/',
  },
  {
    title: '퀴즈',
    icon: <Zap />,
    link: '/quiz/',
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    link: '/admin/settings',
  },
];
