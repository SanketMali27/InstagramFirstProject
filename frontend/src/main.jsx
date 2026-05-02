import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
        <Toast />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
