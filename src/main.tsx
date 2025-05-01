
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initServices } from './services/initServices';

// Initialize services before rendering the app
initServices();

console.info('🚀 Initializing application services...');
console.info('✅ SpringBoot backend integration enabled');
console.info('✅ Application services initialized');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
