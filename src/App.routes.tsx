import { RouteObject } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import IBKRIntegrationPage from './pages/IBKRIntegrationPage';
import IBKRCallbackPage from './pages/IBKRCallbackPage';
import IBKRTestPage from './pages/IBKRTestPage';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/ibkr-integration',
    element: <IBKRIntegrationPage />,
  },
  {
    path: '/auth/ibkr/callback',
    element: <IBKRCallbackPage />,
  },
  {
    path: '/ibkr-test',
    element: <IBKRTestPage />,
  },
];
