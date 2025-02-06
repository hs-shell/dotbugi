import { TYPES } from '@/content/types';
import { Content } from './components/Content';
import { Sidebar } from './components/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useState } from 'react';

export default function App() {
  // const [activeTab, setActiveTab] = useState(TYPES.vod);
  return (
    <>
      <div className="bg-slate-50 zinc-900 min-h-screen overflow-hidden relative">
        <div className="flex items-center justify-center">
          <div className="flex flex-col h-screen px-4 w-full">
            <main className="h-screen overflow-hidden px-32 ">
              <Content />
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
