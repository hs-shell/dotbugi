import { createRoot } from 'react-dom/client';

import '@/i18n';
import ConnectApp from './ConnectApp';
import { takePendingRequest } from '@/lib/mcpConnect/takePendingRequest';

import './connect.css';

// 렌더 전에 한 번만 꺼낸다 (StrictMode 이중 effect 로 두 번 꺼내 지우는 일을 피함)
takePendingRequest().then((request) => {
  createRoot(document.getElementById('root')!).render(<ConnectApp request={request} />);
});
