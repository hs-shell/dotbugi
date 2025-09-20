import { TYPES } from '@/content/types';
import { NotebookText, Video, Zap } from 'lucide-react';

export const data = [
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
];
