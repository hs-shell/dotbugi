import { NotebookText, Video, Zap } from 'lucide-react';
import i18n from '@/i18n';

export enum TAB_LABEL {
  vod = 'vod',
  assignment = 'assignment',
  quiz = 'quiz',
}

export function getTabLabel(tab: TAB_LABEL): string {
  const t = i18n.t.bind(i18n);
  switch (tab) {
    case TAB_LABEL.vod:
      return t('vod', { ns: 'common' });
    case TAB_LABEL.assignment:
      return t('assign', { ns: 'common' });
    case TAB_LABEL.quiz:
      return t('quiz', { ns: 'common' });
  }
}

export const data = [
  {
    icon: <Video />,
    type: TAB_LABEL.vod,
  },
  {
    icon: <NotebookText />,
    type: TAB_LABEL.assignment,
  },
  {
    icon: <Zap />,
    type: TAB_LABEL.quiz,
  },
];
