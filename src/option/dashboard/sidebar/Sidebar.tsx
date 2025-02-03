import { SidebarItems } from './SidebarItems';
import { SidebarHeader } from './SidebarHeader';
import { useDashboardContext } from '../Provider';

interface SidebarProps {
  mobileOrientation: 'start' | 'end';
}

export function Sidebar({ mobileOrientation }: SidebarProps) {
  const { sidebarOpen } = useDashboardContext();

  const mobileOrientationClass = mobileOrientation === 'start' ? 'left-0' : 'right-0 lg:left-0';

  const sidebarStateClass = sidebarOpen
    ? 'absolute duration-500 ease-in transition-all w-8/12 z-40 sm:w-5/12 md:w-64'
    : 'duration-700 ease-out hidden transition-all lg:w-24';

  return (
    <aside
      className={`
        h-screen overflow-y-auto top-0 lg:absolute lg:block lg:z-40
        ${mobileOrientationClass} ${sidebarStateClass}
        bg-white zinc-900
        text-slate-900 dark:text-slate-50
        ${sidebarOpen ? 'border-none shadow-2xl shadow-slate-300' : 'border-slate-200'}
      `}
      style={{ borderRight: '1px solid ' }}
    >
      <div className="pb-32 lg:pb-12">
        <SidebarHeader />
        <SidebarItems />
      </div>
    </aside>
  );
}
