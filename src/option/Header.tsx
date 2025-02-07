import { loadDataFromStorage } from '@/lib/storage';
import { TimeAgo } from '@/lib/utils';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
export default function Header({ location }: { location: string }) {
  const [lastRequest, setLastRequest] = useState('');
  useEffect(() => {
    loadDataFromStorage('lastRequestTime', (data: string | null) => {
      if (!data) setLastRequest('기록이 존재하지 않습니다.');
      else setLastRequest(TimeAgo(parseInt(data)));
    });
  }, []);

  console.log(location);
  let title = '안녕하세요';

  switch (location) {
    case '/vod':
      title = '동영상 강의 목록';
      break;
    case '/assignment':
      title = '과제 목록';
      break;
    case '/quiz':
      title = '퀴즈 목록';
      break;
    default:
      title = '대시보드 🚀';
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
