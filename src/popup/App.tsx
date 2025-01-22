import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '@/assets/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      className="max-w-screen-md p-8 text-center flex flex-col justify-center items-center"
      style={{
        margin: 0,
        display: 'flex',
        placeItems: 'center',
        minWidth: '320px',
        minHeight: '100vh',
      }}
    >
      <div className="flex justify-center items-center space-x-4 mb-8 gap-4">
        <a href="https://vite.dev" target="_blank">
          <img
            src={viteLogo}
            className="h-16 p-1 transition filter hover:drop-shadow-[0_0_2em_rgba(100,108,255,0.67)]"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="h-16 p-1 transition filter hover:drop-shadow-[0_0_2em_rgba(97,218,251,0.67)] animate-spin"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-3xl font-bold leading-tight">Vite + React</h1>
      <div className="card p-8 my-6 border rounded-lg">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="rounded-lg border border-transparent px-4 py-2 text-md text-zinc-100 font-medium bg-gray-900 hover:border-indigo-400 transition"
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-600">
          Edit <code className="text-indigo-400">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-400 mt-6">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
