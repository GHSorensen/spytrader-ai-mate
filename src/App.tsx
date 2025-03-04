
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Routes,
  BrowserRouter,
  Outlet
} from "react-router-dom";
import DashboardPage from './pages/DashboardPage';
import DataProviderPage from './pages/DataProviderPage';
import InteractiveBrokersPage from './pages/InteractiveBrokersPage';
import TDIntegrationPage from './pages/TDIntegrationPage';
import IBKRIntegrationPage from './pages/IBKRIntegrationPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import IBKRDebugPage from './pages/IBKRDebugPage';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="data-providers" element={<DataProviderPage />} />
          <Route path="interactive-brokers" element={<InteractiveBrokersPage />} />
          <Route path="td-ameritrade" element={<TDIntegrationPage />} />
          <Route path="ibkr" element={<IBKRIntegrationPage />} />
          <Route path="ibkr/debug" element={<IBKRDebugPage />} />
        </Route>
        <Route path="/auth/td-ameritrade/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/ibkr/callback" element={<AuthCallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
