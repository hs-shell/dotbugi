import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import 'src/styles/option.css';
import { DashboardLayout } from '@/option/dashboard/Layout';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <Router>
        <DashboardLayout>
          <App />
        </DashboardLayout>
      </Router>
    </React.StrictMode>
  );
}
