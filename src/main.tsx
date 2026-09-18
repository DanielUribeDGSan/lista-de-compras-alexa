import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

let refreshing = false;

// Register PWA service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('PWA Service Worker registrado:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available - skip waiting and reload once
              if (!refreshing) {
                refreshing = true;
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          });
        }
      });
    })
    .catch((error) => {
      console.log('PWA Service Worker registro fallido:', error);
    });

  // Reload when the new service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
