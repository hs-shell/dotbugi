import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import styles from '@/styles/shadow.css?inline';
import { createShadowRoot } from '@/popover/lib/createShadowRoot';
import { useTranslation } from 'react-i18next';

interface PendingDialogProps {
  isPending: boolean;
  onClose?: () => void;
}

export default function PendingDialog({ isPending, onClose }: PendingDialogProps) {
  const { t } = useTranslation(['popover', 'common']);
  const [open, setOpen] = useState(false);
  const [cancelEnabled, setCancelEnabled] = useState(false);
  const [modalContainer, setModalContainer] = useState<Element | DocumentFragment | null>(null);
  const [hostElement, setHostElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let host = document.getElementById('shadow-modal-host') as HTMLElement | null;
    if (!host) {
      host = document.createElement('div');
      host.id = 'shadow-modal-host';
      host.style.zIndex = '9999';
      host.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      document.body.prepend(host);
    }
    setHostElement(host);
    const newShadowRoot = createShadowRoot(
      host,
      [
        styles,
        `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      `,
      ],
      'modal-container'
    );
    setModalContainer(newShadowRoot);
  }, []);

  useEffect(() => {
    if (hostElement) {
      hostElement.style.display = open ? 'flex' : 'none';
    }
  }, [open, hostElement]);

  useEffect(() => {
    if (isPending) {
      setOpen(true);
      setCancelEnabled(false);
    } else {
      setOpen(false);
      setCancelEnabled(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      timer = setTimeout(() => {
        setCancelEnabled(true);
      }, 15000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [open]);

  const handleClose = () => {
    if (cancelEnabled) {
      setOpen(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const modalContent = (
    <Card className="w-3/4 max-w-4xl">
      <CardHeader className="m-4">
        <CardTitle className="text-4xl font-bold">{t('pending.title')}</CardTitle>
        <p className="my-6 text-xl text-zinc-500 font-medium">{t('pending.message')}</p>
      </CardHeader>
      <CardContent className="m-4">
        <div className="flex flex-col items-center justify-center py-6 space-y-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="my-6 text-xl text-zinc-900 font-medium">{t('pending.autoClose')}</p>
        </div>
        <Button
          variant={'destructive'}
          onClick={handleClose}
          className="w-full h-16 rounded-lg"
          disabled={!cancelEnabled}
        >
          <span className="text-xl text-white font-semibold">{t('common:cancel')}</span>
        </Button>
      </CardContent>
    </Card>
  );

  if (!modalContainer) return null;
  return ReactDOM.createPortal(modalContent, modalContainer);
}
