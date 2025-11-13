import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

import VodPage from 'src/pages/VodPage';
import AssignmentPage from 'src/pages/AssignmentPage';
import DashboardPage from '@/pages/DashboardPage';
import QuizPage from '@/pages/QuizPage';
import Header from './Header';
import Labo from './Labo';
import ColorSetting from './ColorSetting';

const pageVariants = {
  initial: {
    opacity: 0,
    x: '-5%',
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: '5%',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        //@ts-expect-error ignore
        transition={pageTransition}
      >
        <Header location={location.pathname} />
        <Routes location={location}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vod" element={<VodPage />} />
          <Route path="/assignment" element={<AssignmentPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/labo" element={<Labo />} />
          <Route path="/color" element={<ColorSetting />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <>
      <div className="bg-white min-h-screen flex">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col h-screen px-4 w-full">
            <main className="h-screen overflow-y-scroll px-12">
              <AnimatedRoutes />
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
