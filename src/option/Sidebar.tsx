'use client';

import { Calendar, Github, LayoutDashboard, NotebookText, Palette, Star, Video, Zap } from 'lucide-react';
import type React from 'react';
import { Link, useLocation } from 'react-router-dom';
import icon from '@/assets/icon.png';
import GitHubStarBanner from './GithubStarBanner';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:block w-60 min-w-60 bg-slate-50 text-gray-800 h-screen shadow-lg border-r border-slate-100">
      <div className="flex flex-col h-full py-6 px-4">
        <div className="flex items-center mb-8">
          <div className="shrink-0">
            <div
              className="flex items-center justify-center w-14 h-14 text-white text-2xl font-bold rounded-full cursor-pointer"
              onClick={() => {
                window.open('https://learn.hansung.ac.kr/', '_blank');
              }}
            >
              <img
                src={icon || '/placeholder.svg'}
                className="rounded-full hover:shadow-lg hover:shadow-zinc-400 transition-all duration-500"
              />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-xl font-bold text-gray-900">한성대학교</div>
            <span className="text-sm text-gray-500">돋부기 🔎</span>
          </div>
        </div>

        <nav className="flex flex-col flex-1">
          <div className="flex items-center mt-6 mb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pr-2">메인</div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <ul className="space-y-2">
            <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="대시보드" />
          </ul>

          <div className="flex items-center mt-6 mb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pr-2">할 일</div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <ul className="space-y-2">
            <SidebarItem to="/vod" icon={<Video size={20} />} label="강의" />
            <SidebarItem to="/assignment" icon={<NotebookText size={20} />} label="과제" />
            <SidebarItem to="/quiz" icon={<Zap size={20} />} label="퀴즈" />
          </ul>
          <div className="flex items-center mt-6 mb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pr-2">실험실</div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <ul className="space-y-2">
            <SidebarItem to="/labo" icon={<Calendar size={20} />} label="캘린더 연동" />
            <SidebarItem to="/color" icon={<Palette size={20} />} label="색상 변경" />
          </ul>

          <div className="flex-1"></div>

          <GitHubStarBanner />
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

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to; // 현재 경로와 to가 일치하는지 확인

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-slate-700 ${
          isActive
            ? 'bg-slate-200' // 현재 탭이면 파란색 배경 + 흰색 글씨
            : 'hover:bg-slate-200'
        }`}
      >
        <span className={'text-slate-700'}>{icon}</span>
        <span className="ml-3 text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
};

export default Sidebar;
