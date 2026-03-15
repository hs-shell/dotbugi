import { TAB_LABEL } from '@/content/types';
import { NotebookText, Video, Zap } from 'lucide-react';

export const data = [
  {
    title: '강의',
    icon: <Video />,
    type: TAB_LABEL.vod,
  },
  {
    title: '과제',
    icon: <NotebookText />,
    type: TAB_LABEL.assignment,
  },
  {
    title: '퀴즈',
    icon: <Zap />,
    type: TAB_LABEL.quiz,
  },
];
