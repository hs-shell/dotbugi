import { DocIcon } from './icons/DocIcon';
import { StatusIcon } from './icons/StatusIcon';
import { CreditIcon } from './icons/CreditIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BadgeCheckIcon, Home, NotebookText, Video, Zap } from 'lucide-react';

export const data = [
  {
    title: 'Home',
    icon: <Home />,
    link: '/',
  },
  {
    title: 'Archives',
    icon: <Video />,
    link: '/admin/archives',
  },
  {
    title: 'Credits',
    icon: <NotebookText />,
    link: '/admin/credits',
  },
  {
    title: 'Documentation',
    icon: <Zap />,
    link: '/admin/documentation',
  },
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    link: '/admin/settings',
  },
];
