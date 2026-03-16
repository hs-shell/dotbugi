import { BadgeCheck, Clock, Siren, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TimeDifferenceResult } from '@/types';

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(24, 24, 27, 0.6)',
  borderRadius: '4px',
  fontSize: '11px',
  paddingTop: '1px',
  paddingBottom: '1px',
  paddingLeft: '4px',
  paddingRight: '4px',
  zIndex: '9999',
};

interface CardFooterContentProps {
  timeDifference: TimeDifferenceResult;
  tooltipText: string;
  statusColor: string;
  statusIcon: 'check' | 'siren' | 'warning';
  statusLabel: string;
}

function StatusIcon({ icon }: { icon: CardFooterContentProps['statusIcon'] }) {
  switch (icon) {
    case 'check':
      return <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />;
    case 'siren':
      return <Siren className="w-5 h-5 mb-1" strokeWidth={2.5} />;
    case 'warning':
      return <TriangleAlert className="w-5 h-5" strokeWidth={2.5} />;
  }
}

export default function CardFooterContent({
  timeDifference,
  tooltipText,
  statusColor,
  statusIcon,
  statusLabel,
}: CardFooterContentProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger className="bg-transparent">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" strokeWidth={2} />
            <span className="text-base items-center">{timeDifference.message}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent style={TOOLTIP_STYLE}>{tooltipText}</TooltipContent>
      </Tooltip>
      <div className={`flex items-center space-x-2 ${statusColor} font-semibold`}>
        <StatusIcon icon={statusIcon} />
        <div className="text-base">{statusLabel}</div>
      </div>
    </>
  );
}
