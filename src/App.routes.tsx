
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import DashboardPage from './pages/DashboardPage';
import TradesPage from './pages/TradesPage';
import RiskConsole from './pages/RiskConsole';
import NotFound from './pages/NotFound';
import RouterErrorBoundary from './components/RouterErrorBoundary';
import { IBKRTestPage } from './pages/IBKRTestPage';
import { IBKRIntegrationPage } from './pages/IBKRIntegrationPage';
import { SchwabIntegrationPage } from './pages/SchwabIntegrationPage';
import { SchwabCallbackPage } from './pages/SchwabCallbackPage';
import { IBKRCallbackPage } from './pages/IBKRCallbackPage';
import RiskMonitoringTest from './pages/RiskMonitoringTest';
import { IBKRRealTimeDataTest } from './pages/IBKRRealTimeDataTest';
import { AuthenticationPage } from './components/auth/AuthenticationPage';
import { UserProfilePage } from './components/auth/UserProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
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
    path: '/dashboard-page',
    element: <DashboardPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/trades',
    element: <TradesPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/risk-console',
    element: <RiskConsole />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/risk-monitoring-test',
    element: <RiskMonitoringTest />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/ibkr-test',
    element: <IBKRTestPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/ibkr-integration',
    element: <IBKRIntegrationPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/schwab-integration',
    element: <SchwabIntegrationPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/auth/schwab',
    element: <SchwabCallbackPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/auth/ibkr',
    element: <IBKRCallbackPage />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '/ibkr-data-test',
    element: <IBKRRealTimeDataTest />,
    errorElement: <RouterErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouterErrorBoundary />,
  },
]);
