import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// Error tracking (Sentry)
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Initialize Sentry in production
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.5,
    environment: process.env.REACT_APP_ENV || 'production',
    beforeSend(event) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}

// Remove loading indicator
const removeLoadingIndicator = () => {
  const loading = document.getElementById('initial-loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
    }, 300);
  }
};

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove loading after render
setTimeout(removeLoadingIndicator, 100);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Log app version in development
if (process.env.NODE_ENV === 'development') {
  console.log(
    `%c🚀 Unimates v${process.env.REACT_APP_VERSION || '1.0.0'} - Development Mode`,
    'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: bold;'
  );
}

// Handle offline/online events
window.addEventListener('online', () => {
  console.log('📶 App is online');
});

window.addEventListener('offline', () => {
  console.log('📶 App is offline');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.captureException(event.reason);
  }
});

// Handle errors
window.addEventListener('error', (event) => {
  console.error('❌ Global Error:', event.error);
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.captureException(event.error);
  }
});