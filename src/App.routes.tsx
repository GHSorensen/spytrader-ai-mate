
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AuthenticationPage from './components/auth/AuthenticationPage';
import UserProfilePage from './components/auth/UserProfilePage';
import { RouterErrorBoundary } from './components/RouterErrorBoundary';
import TradeAutomation from './components/TradeAutomation';
import IBKRIntegrationView from './components/ibkr/IBKRIntegrationView';
import IBKRTestDashboard from './components/ibkr/test/IBKRTestDashboard';
import DetailedPerformancePage from './components/performance/DetailedPerformancePage';
import SchwabIntegrationPage from './pages/SchwabIntegrationPage';
import { SchwabCallbackHandler } from './components/spy/settings/broker/SchwabCallbackHandler';

export const AppRoutes = () => {
  return (
    <RouterErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/auth" element={<AuthenticationPage />} />
        <Route path="/auth/schwab" element={<SchwabCallbackHandler />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trades" element={<TradeAutomation />} />
        <Route path="/performance" element={<DetailedPerformancePage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/ibkr-integration" element={<IBKRIntegrationView />} />
        <Route path="/ibkr-test" element={<IBKRTestDashboard />} />
        <Route path="/schwab-integration" element={<SchwabIntegrationPage />} />
        <Route path="*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </RouterErrorBoundary>
  );
};
