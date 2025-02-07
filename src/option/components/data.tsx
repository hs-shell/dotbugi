import { TYPES } from '@/content/types';
import { Home, NotebookText, Settings, Video, Zap } from 'lucide-react';

export const data = [
  // {
  //   title: 'Home',
  //   icon: <Home />,
  //   type: TYPES.vod,
  // },
  {
    title: '강의',
    icon: <Video />,
    type: TYPES.vod,
  },
  {
    title: '과제',
    icon: <NotebookText />,
    type: TYPES.assignment,
  },
  {
    title: '퀴즈',
    icon: <Zap />,
    type: TYPES.quiz,
  },
  // {
  //   title: 'Settings',
  //   icon: <Settings />,
  //   type: TYPES.,
  // },
];
