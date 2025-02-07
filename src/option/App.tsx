import { Toaster } from '@/components/ui/toaster';
import Sidebar from './Sidebar';
import { Calendar } from './calendar';
import SummaryCard from './SummaryCard';

export default function App() {
  return (
    <>
      <div className="bg-white min-h-screen flex">
        <Sidebar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col h-screen px-4 w-full">
            <main className="h-screen overflow-y-scroll px-12 py-16">
              <SummaryCard />
              {/* <hr className="my-8" /> */}
              <Calendar />
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
