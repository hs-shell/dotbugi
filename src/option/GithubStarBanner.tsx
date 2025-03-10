import type React from 'react';
import { useState } from 'react';
import { Github } from 'lucide-react';
import { motion } from 'framer-motion';

const GitHubStarBanner: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open('https://github.com/hs-shell/dotbugi', '_blank');
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mt-4 mb-2 mx-1 py-4 px-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center mb-2 space-x-2">
          <Github size={22} className="text-slate-700 group-hover:text-slate-900" />
          <div className="relative w-5 h-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 text-amber-500 group-hover:text-amber-600"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <motion.svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute inset-0 text-amber-500 group-hover:text-amber-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ transformOrigin: 'center' }}
              />
            </motion.svg>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">이 프로젝트가 마음에 드시나요?</p>
        <p className="text-xs text-slate-500 group-hover:text-slate-700 mt-1">GitHub에서 스타를 눌러주세요!</p>
      </div>
    </div>
  );
};

export default GitHubStarBanner;
