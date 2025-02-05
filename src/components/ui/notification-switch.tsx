import { Switch } from '@heroui/switch';
import { Bell, BellOffIcon } from 'lucide-react';

export default function NotificationSwitch({ isSelected, onChange }: { isSelected: boolean; onChange: () => void }) {
  return (
    <Switch
      color="warning"
      isSelected={isSelected}
      onChange={() => {
        onChange();
      }}
      endContent={<BellOffIcon />}
      size="sm"
      startContent={<Bell />}
    />
  );
}
