import { loadDataFromStorage } from '@/lib/storage';
import { TimeAgo } from '@/lib/utils';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Header({ location }: { location: string }) {
  const { t } = useTranslation(['option', 'common']);
  const [lastRequest, setLastRequest] = useState('');
  useEffect(() => {
    loadDataFromStorage('lastRequestTime', (data: string | null) => {
      if (!data) setLastRequest(t('common:noRecords'));
      else setLastRequest(TimeAgo(parseInt(data)));
    });
  }, [t]);

  let title = t('header.hello');

  switch (location) {
    case '/vod':
      title = t('header.vodList');
      window.document.title = t('pageTitle.vodList');
      break;
    case '/assignment':
      title = t('header.assignList');
      window.document.title = t('pageTitle.assignList');
      break;
    case '/quiz':
      title = t('header.quizList');
      window.document.title = t('pageTitle.quizList');
      break;
    default:
      title = t('header.dashboard');
      window.document.title = t('pageTitle.dashboard');
      break;
  }
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-10 mb-6 space-y-4 md:space-y-0 px-4">
      <h1 className="text-3xl font-semibold text-primary">{title}</h1>
      <div className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
        <History className="h-4 w-4" />
        <span className="font-medium">{lastRequest}</span>
      </div>
    </div>
  );
}
