import { useDashboardContext } from './Provider';

export function Overlay() {
  const { sidebarOpen, closeSidebar } = useDashboardContext();
  return (
    <div
      onClick={closeSidebar}
      className={sidebarOpen ? 'fixed left-0 top-0 z-30 h-screen w-screen bg-black opacity-40 lg:bg-transparent' : ''}
    />
  );
}
