
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SchwabCallbackHandler } from './components/spy/settings/broker/SchwabCallbackHandler.tsx'
import NotFound from './pages/NotFound.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import QueryClientProvider from './components/QueryClientProvider.tsx'
import UserProfilePage from './components/auth/UserProfilePage.tsx'
import AuthenticationPage from './components/auth/AuthenticationPage.tsx'
import { config, environment } from '@/config/environment'

// Performance marks for startup metrics
performance.mark('app-init-start');

// Initialize the React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Performance measurement for app initialization
performance.mark('app-init-end');
performance.measure('app-initialization', 'app-init-start', 'app-init-end');
console.log(`App initialized in ${performance.getEntriesByName('app-initialization')[0].duration.toFixed(2)}ms`);

// Initialize error monitoring after the app is loaded
setTimeout(() => {
  try {
    import('./lib/errorMonitoring/index').then(module => {
      try {
        module.initErrorMonitoring();
      } catch (error) {
        console.error('Failed to initialize error monitoring:', error);
      }
    }).catch(error => {
      console.error('Failed to load error monitoring module:', error);
    });
  } catch (error) {
    console.error('Error setting up monitoring:', error);
  }
}, 3000);
