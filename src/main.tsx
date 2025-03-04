
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { SchwabCallbackHandler } from './components/spy/settings/broker/SchwabCallbackHandler.tsx'
import NotFound from './pages/NotFound.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'dashboard',
        element: <></> // These are already handled inside App.tsx
      },
      {
        path: 'trade-automation',
        element: <></> // These are already handled inside App.tsx
      },
      {
        path: 'performance',
        element: <></> // These are already handled inside App.tsx
      },
      {
        path: 'risk-console',
        element: <></> // These are already handled inside App.tsx
      },
      {
        path: 'risk-monitoring-test',
        element: <></> // These are already handled inside App.tsx
      },
    ]
  },
  {
    path: '/auth/callback',
    element: <SchwabCallbackHandler />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
