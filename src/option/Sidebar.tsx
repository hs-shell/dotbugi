import { Home, NotepadText, Video, Zap } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:block w-60 bg-slate-50 text-gray-800 h-screen shadow-lg border-r border-slate-100">
      <div className="flex flex-col h-full py-6 px-4">
        <div className="flex items-center mb-8">
          <div className="shrink-0">
            <a
              className="flex items-center justify-center w-14 h-14 text-white text-2xl font-bold rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
              href="/"
            >
              P
            </a>
          </div>
          <div className="ml-4">
            <div className="text-xl font-bold text-gray-900">한성대학교</div>
            <span className="text-sm text-gray-500">돋부기 🔎</span>
          </div>
        </div>

        <nav className="flex flex-col flex-grow">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">메인</div>
          <ul className="space-y-2">
            <SidebarItem to="/" icon={<Home size={20} />} label="홈" />
          </ul>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4">항목</div>
          <ul className="space-y-2">
            <SidebarItem to="/vod" icon={<Video size={20} />} label="강의" />
            <SidebarItem to="/assignment" icon={<NotepadText size={20} />} label="과제" />
            <SidebarItem to="/quiz" icon={<Zap size={20} />} label="퀴즈" />
          </ul>
        </nav>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => (
  <li>
    <Link
      to={to}
      className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-slate-200 transition-colors duration-200"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="ml-3 text-sm font-medium">{label}</span>
    </Link>
  </li>
);

export default Sidebar;
