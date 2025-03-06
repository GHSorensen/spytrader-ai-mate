
import { useState, useEffect, useCallback } from 'react';
import { useConnectionCheck } from './useConnectionCheck';
import { useConnectionReconnect } from './useConnectionReconnect';
import { UseIBKRConnectionStatusReturn } from './types';
import { CONNECTION_CHECK_INTERVAL, getDataSource } from './utils';

/**
 * Hook to monitor IBKR connection status with enhanced logging
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
      console.log("[useIBKRConnectionStatus] Running initial connection check...");
      const { connected, quotesDelayed } = await checkConnection();
      const newDataSource = getDataSource(connected, quotesDelayed);
      
      console.log(`[useIBKRConnectionStatus] Initial check result: connected=${connected}, dataSource=${newDataSource}`);
      setIsConnected(connected);
      setDataSource(newDataSource);
      
      if (connected) {
        console.log(`[useIBKRConnectionStatus] Successfully connected to IBKR with ${newDataSource} data`);
      } else {
        console.log("[useIBKRConnectionStatus] Not connected to IBKR, using mock data");
      }
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
    console.log("[useIBKRConnectionStatus] Manual connection check requested");
    const { connected, quotesDelayed } = await checkConnection();
    const newDataSource = getDataSource(connected, quotesDelayed);
    
    console.log(`[useIBKRConnectionStatus] Check result: connected=${connected}, dataSource=${newDataSource}`);
    
    // Only update state if there was a change to avoid unnecessary rerenders
    if (connected !== isConnected) {
      console.log(`[useIBKRConnectionStatus] Connection state changed: ${isConnected} → ${connected}`);
      setIsConnected(connected);
    }
    
    if (newDataSource !== dataSource) {
      console.log(`[useIBKRConnectionStatus] Data source changed: ${dataSource} → ${newDataSource}`);
      setDataSource(newDataSource);
    }
  };

  // Wrap reconnect to update state on success
  const handleReconnect = async () => {
    console.log("[useIBKRConnectionStatus] Reconnect requested");
    const success = await reconnect();
    
    if (success) {
      console.log("[useIBKRConnectionStatus] Reconnect successful");
      setIsConnected(true);
      setDataSource('live'); // We'll get the actual value on next check
      setTimeout(handleCheckConnection, 1000); // Check status after reconnection
    } else {
      console.log("[useIBKRConnectionStatus] Reconnect failed");
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
