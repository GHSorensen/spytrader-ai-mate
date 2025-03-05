
import { useState, useEffect } from 'react';
import { useConnectionCheck } from './useConnectionCheck';
import { useConnectionReconnect } from './useConnectionReconnect';
import { UseIBKRConnectionStatusReturn } from './types';
import { CONNECTION_CHECK_INTERVAL, getDataSource } from './utils';

/**
 * Hook to monitor IBKR connection status
 */
export function useIBKRConnectionStatus(): UseIBKRConnectionStatusReturn {
  const { checkConnection, connectionDiagnostics } = useConnectionCheck();
  const { reconnect } = useConnectionReconnect();
  
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'delayed' | 'mock'>('mock');

  // Effect to check connection on mount
  useEffect(() => {
    console.log("[useIBKRConnectionStatus] Hook mounted, checking connection");
    const runInitialCheck = async () => {
      const { connected, quotesDelayed } = await checkConnection();
      setIsConnected(connected);
      setDataSource(getDataSource(connected, quotesDelayed));
    };
    
    runInitialCheck();
    
    // Set up interval to periodically check connection
    const checkInterval = setInterval(() => {
      console.log("[useIBKRConnectionStatus] Periodic connection check running");
      runInitialCheck();
    }, CONNECTION_CHECK_INTERVAL);
    
    return () => {
      console.log("[useIBKRConnectionStatus] Clearing connection check interval");
      clearInterval(checkInterval);
    };
  }, [checkConnection]);

  // Wrap the connection check to update state
  const handleCheckConnection = async () => {
    const { connected, quotesDelayed } = await checkConnection();
    setIsConnected(connected);
    setDataSource(getDataSource(connected, quotesDelayed));
  };

  // Wrap reconnect to update state on success
  const handleReconnect = async () => {
    const success = await reconnect();
    if (success) {
      setIsConnected(true);
      setDataSource('live'); // We'll get the actual value on next check
      setTimeout(handleCheckConnection, 1000); // Check status after reconnection
    }
    return success;
  };

  return {
    isConnected,
    dataSource,
    connectionDiagnostics,
    checkConnection: handleCheckConnection,
    reconnect: handleReconnect
  };
}
