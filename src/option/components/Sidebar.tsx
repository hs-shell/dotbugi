import { SidebarHeader } from './SidebarHeader';
import { TYPES } from '@/content/types';
import { data } from './data';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: TYPES; setActiveTab: (type: TYPES) => void }) {
  return (
    <aside
      className={`
        justify-center items-center
        h-screen z-30
        zinc-900 
        text-slate-900 dark:text-slate-50 border-slate-200
        bg-white
      `}
      style={{ borderRight: '1px solid ' }}
    >
      <div className="pb-32 lg:pb-12">
        <SidebarHeader />
        <ul className="">
          {data.map((item) => (
            <li
              key={item.title}
              onClick={() => {
                setActiveTab(item.type);
              }}
            >
              <span className="flex items-center justify-start my-1 p-3 w-full text-zinc-900 hover:text-black dark:hover:text-black">
                <div
                  className={`p-2 px-3 ${item.type === activeTab ? 'bg-[rgb(239,239,241)]' : ''} hover:bg-[rgb(239,239,241)] rounded-xl transition-colors duration-300`}
                >
                  <span>{item.icon}</span>
                </div>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
