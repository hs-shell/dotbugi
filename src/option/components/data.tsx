import { NotebookText, Video, Zap } from 'lucide-react';

export enum TAB_LABEL {
  vod = '강의',
  assignment = '과제',
  quiz = '퀴즈',
}

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
