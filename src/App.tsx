
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import Dashboard from './components/Dashboard';
import TradeAutomation from './components/TradeAutomation';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import RiskConsole from './pages/RiskConsole';
import PerformanceDashboard from './components/spy/PerformanceDashboard';
import RiskMonitoringTest from './pages/RiskMonitoringTest';
import notificationService from './services/notification/notificationService';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Set up initial notifications on app load
  useEffect(() => {
    // Demo: Schedule daily portfolio updates
    const currentBalance = 125000; // This would come from your actual portfolio data
    
    // Initialize notification schedule (these would normally be at market open/close)
    notificationService.scheduleMorningUpdate(currentBalance, 0, 0);
    notificationService.scheduleEndOfDayUpdate(currentBalance, 1200, 0.96);
    
    // Sample initial notification on app startup
    notificationService.createNotification(
      'system_message',
      'Welcome back',
      'Your SPY trading AI system is active and monitoring the markets.',
      'low',
      ['in_app']
    );
  }, []);

  return (
    <>
      <Toaster richColors position="top-right" />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade-automation" element={<TradeAutomation />} />
          <Route path="/performance" element={<PerformanceDashboard />} />
          <Route path="/risk-console" element={<RiskConsole />} />
          <Route path="/risk-monitoring-test" element={<RiskMonitoringTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}

export default App;
