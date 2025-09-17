import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Vod } from '@/content/types';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, Siren, TriangleAlert, Video, X } from 'lucide-react';
import { calculateRemainingTimeByRange, calculateTimeDifference, formatDateString } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ModalProps {
  vodList: Vod[];
  onClose: () => void;
}

const CourseDetailModal: React.FC<ModalProps> = ({ vodList, onClose }: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showRemainingTime, setShowRemainingTime] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRemainingTime) {
      timer = setTimeout(() => {
        setShowRemainingTime(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showRemainingTime]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const timeDifference = calculateTimeDifference(vodList[0].range);

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-background w-full max-w-lg rounded-lg shadow-lg transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
          <div className="mb-1 space-y-0.5">
            <h2 className="text-2xl font-bold">{vodList[0].courseTitle}</h2>
            <p className="text-base text-muted-foreground">{vodList[0].subject}</p>
          </div>

          <ScrollArea className="h-auto">
            <div className="space-y-3 py-2">
              {vodList.map((vod, index) => {
                const isAttendance = vod.isAttendance.toLowerCase() === 'o';
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-shadow border-l-4 hover:shadow-md py-2 ${isAttendance ? 'border-l-green-500' : timeDifference.borderLeftColor}`}
                    onClick={() => {
                      window.open(`${vod.url.replace('view', 'viewer')}`, '_blank', 'VodContentWindow');
                    }}
                  >
                    <CardContent className="flex items-center p-4">
                      <Video className="mr-4 h-6 w-6 text-primary" />
                      <div className="flex-grow">
                        <p className="text-base font-medium">{vod.title}</p>
                        <p className="text-sm text-muted-foreground">{vod.length}</p>
                      </div>
                      {isAttendance ? (
                        <BadgeCheck className={`h-5 w-5 text-green-500`} />
                      ) : timeDifference.message.includes('마감') ? (
                        <Siren className={`h-6 w-6 ${timeDifference.textColor}`} />
                      ) : (
                        <TriangleAlert className={`h-5 w-5 ${timeDifference.textColor}`} />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
          <div className="w-full flex flex-col items-start mt-2 space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="bg-transparent">
                  <Badge variant="secondary" className="font-semibold hover:bg-zinc-200 py-1">
                    출석인정기간 : {formatDateString(vodList[0].range)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent
                  style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.6)',
                    opacity: 60,
                    borderRadius: '4px',
                    fontSize: '11px',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                  }}
                >
                  {calculateRemainingTimeByRange(vodList[0].range)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('shadow-modal-root');
  if (!modalRoot) {
    console.error('Modal root element not found.');
    return null;
  }

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default CourseDetailModal;
