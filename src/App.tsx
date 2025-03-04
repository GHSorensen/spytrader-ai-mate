import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import DashboardPage from './pages/DashboardPage';
import DataProviderPage from './pages/DataProviderPage';
import InteractiveBrokersPage from './pages/InteractiveBrokersPage';
import TDIntegrationPage from './pages/TDIntegrationPage';
import IBKRIntegrationPage from './pages/IBKRIntegrationPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import IBKRDebugPage from './pages/IBKRDebugPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/data-providers",
    element: <DataProviderPage />,
  },
  {
    path: "/interactive-brokers",
    element: <InteractiveBrokersPage />,
  },
  {
    path: "/td-ameritrade",
    element: <TDIntegrationPage />,
  },
  {
    path: "/auth/td-ameritrade/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/auth/ibkr/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/ibkr",
    element: <IBKRIntegrationPage />,
  },
  {
    path: "/ibkr/debug",
    element: <IBKRDebugPage />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
