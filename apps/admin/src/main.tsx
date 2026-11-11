import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { initializeStore } from '@sims/shared';
import './index.css';

// Ensure shared store is seeded
initializeStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </React.StrictMode>
);

