import icon from '@/assets/icon.png';

export function SidebarHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-center bg-white zinc-900">
      <img src={icon} width={80} height={80} className="p-4 rounded-full" />
    </div>
  );
}
