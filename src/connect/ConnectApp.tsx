import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { sendSessionToMcp } from '@/lib/mcpConnect/sendSessionToMcp';
import type { ConnectRequest } from '@/lib/mcpConnect/validate';

interface ConnectAppProps {
  request: ConnectRequest | null;
}

type Phase = 'idle' | 'sending' | 'done';

export default function ConnectApp({ request }: ConnectAppProps) {
  const { t } = useTranslation('connect');
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('');

  if (!request) {
    return <p className="p-4 text-sm">{t('noPending')}</p>;
  }

  const handleConnect = async () => {
    setPhase('sending');
    const result = await sendSessionToMcp(request);
    if (result.ok) setStatus(t('success'));
    else if ('status' in result) setStatus(t('httpError', { status: result.status }));
    else setStatus(t(result.reason === 'permission' ? 'permissionDenied' : 'networkError'));
    // 요청은 창을 열 때 이미 저장소에서 지웠으므로, 실패하면 CLI 에서 다시 시작한다
    setPhase('done');
  };

  return (
    <main className="flex flex-col gap-3 p-4 text-sm leading-relaxed">
      <h1 className="text-base font-semibold">{t('title')}</h1>
      <p>{t('description', { port: request.port })}</p>
      <p className="text-muted-foreground">{t('permissionNotice')}</p>
      {phase !== 'done' && (
        <div className="flex gap-2">
          <Button onClick={handleConnect} disabled={phase === 'sending'}>
            {phase === 'sending' ? t('connecting') : t('connect')}
          </Button>
          <Button variant="outline" onClick={() => window.close()} disabled={phase === 'sending'}>
            {t('cancel')}
          </Button>
        </div>
      )}
      {status && <p role="status">{status}</p>}
    </main>
  );
}
