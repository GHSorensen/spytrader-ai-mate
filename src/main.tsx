
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { SchwabCallbackHandler } from './components/spy/settings/broker/SchwabCallbackHandler.tsx'
import NotFound from './pages/NotFound.tsx'
import RouterErrorBoundary from './components/RouterErrorBoundary.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import QueryClientProvider from './components/QueryClientProvider.tsx'
import UserProfilePage from './components/auth/UserProfilePage.tsx'
import AuthenticationPage from './components/auth/AuthenticationPage.tsx'
import { Toaster } from '@/components/ui/toaster'
import { config, environment } from '@/config/environment'

// Initialize error monitoring later in a separate useEffect to avoid startup issues
// We'll let the app load first, then set up monitoring

// Fix the root route path to use a wildcard (*) to allow nested routes
const router = createBrowserRouter([
  {
    path: '/*', // Changed from '/' to '/*' to support nested routes properly
    element: <App />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/auth',
    element: <AuthenticationPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/profile',
    element: <UserProfilePage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/auth/callback',
    element: <SchwabCallbackHandler />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouterErrorBoundary />,
  },
])

// Log environment info on startup
console.log(`App starting in ${environment} environment`);
console.log(`API URL: ${config.apiUrl}`);
if (config.logLevel === 'debug') {
  console.log('Debug logging enabled');
}

// Performance marks for startup metrics
performance.mark('app-init-start');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Performance measurement for app initialization
performance.mark('app-init-end');
performance.measure('app-initialization', 'app-init-start', 'app-init-end');
console.log(`App initialized in ${performance.getEntriesByName('app-initialization')[0].duration.toFixed(2)}ms`);
