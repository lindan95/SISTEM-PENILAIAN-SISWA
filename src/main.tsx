import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for Android standalone and offline capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Versi baru tersedia');
  },
  onOfflineReady() {
    console.log('[PWA] Siap digunakan offline di Android & Web');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
