
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

// Fix the root route path to use a wildcard (*) to allow nested routes
const router = createBrowserRouter([
  {
    path: '/',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
