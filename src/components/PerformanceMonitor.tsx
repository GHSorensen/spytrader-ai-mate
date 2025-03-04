
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/errorMonitoring';

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

const PerformanceMonitor = () => {
  const location = useLocation();

  useEffect(() => {
    // Basic navigation tracking
    trackEvent('page_view', { 
      path: location.pathname,
      timestamp: new Date().toISOString()
    });

    // Report device and connection information
    if ('connection' in navigator) {
      const navigatorWithConnection = navigator as NavigatorWithConnection;
      
      if (navigatorWithConnection.connection) {
        trackEvent('connection_metrics', {
          effectiveType: navigatorWithConnection.connection.effectiveType,
          downlink: navigatorWithConnection.connection.downlink,
          rtt: navigatorWithConnection.connection.rtt
        });
      }
    }

    // This is a minimal implementation that replaces the previous component
    // The full monitoring functionality has been moved to individual hooks
  }, [location.pathname]);

  return null; // This is a monitoring component so it doesn't render anything
};

export default PerformanceMonitor;
