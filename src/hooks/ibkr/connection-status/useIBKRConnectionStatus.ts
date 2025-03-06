
import { useState, useEffect, useCallback } from 'react';
import { useConnectionCheck } from './useConnectionCheck';
import { useConnectionReconnect } from './useConnectionReconnect';
import { UseIBKRConnectionStatusReturn } from './types';
import { CONNECTION_CHECK_INTERVAL, getDataSource, logConnectionTransition, debugIBKRConnection } from './utils';

/**
 * Hook to monitor IBKR connection status with enhanced logging
 */
export function useIBKRConnectionStatus(): UseIBKRConnectionStatusReturn {
  const { checkConnection, connectionDiagnostics } = useConnectionCheck();
  const { reconnect } = useConnectionReconnect();
  
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'delayed' | 'mock'>('mock');
  const [lastSuccessfulConnection, setLastSuccessfulConnection] = useState<Date | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Helper function to log connection status changes
  const updateConnectionStatus = (connected: boolean, newDataSource: 'live' | 'delayed' | 'mock') => {
    if (connected !== isConnected) {
      logConnectionTransition(isConnected, connected, newDataSource, 'useIBKRConnectionStatus');
      
      if (connected) {
        setLastSuccessfulConnection(new Date());
        console.log("[useIBKRConnectionStatus] Connection established at", new Date().toISOString());
      } else {
        console.log("[useIBKRConnectionStatus] Connection lost at", new Date().toISOString());
        if (lastSuccessfulConnection) {
          const connectionDuration = (new Date().getTime() - lastSuccessfulConnection.getTime()) / 1000;
          console.log(`[useIBKRConnectionStatus] Connection was active for ${connectionDuration.toFixed(1)} seconds`);
        }
        
        // Extra debugging when connection is lost
        console.log("[useIBKRConnectionStatus] Detailed state when connection was lost:");
        debugIBKRConnection();
      }
    }
    
    if (newDataSource !== dataSource) {
      console.log(`[useIBKRConnectionStatus] Data source changed: ${dataSource} → ${newDataSource}`);
    }
    
    setIsConnected(connected);
    setDataSource(newDataSource);
  };

  // Effect to check connection on mount
  useEffect(() => {
    console.log("[useIBKRConnectionStatus] Hook mounted, checking connection");
    
    // Record config state on mount
    const config = localStorage.getItem('ibkr-config');
    console.log("[useIBKRConnectionStatus] IBKR config in localStorage:", config ? "Present" : "Not found");
    
    const runInitialCheck = async () => {
      console.log("[useIBKRConnectionStatus] Running initial connection check...");
      const { connected, quotesDelayed } = await checkConnection();
      const newDataSource = getDataSource(connected, quotesDelayed);
      
      console.log(`[useIBKRConnectionStatus] Initial check result: connected=${connected}, dataSource=${newDataSource}`);
      updateConnectionStatus(connected, newDataSource);
      setLastCheckTime(new Date());
      
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
    console.log("[useIBKRConnectionStatus] Manual connection check requested at", new Date().toISOString());
    setLastCheckTime(new Date());
    
    const { connected, quotesDelayed } = await checkConnection();
    const newDataSource = getDataSource(connected, quotesDelayed);
    
    console.log(`[useIBKRConnectionStatus] Check result: connected=${connected}, dataSource=${newDataSource}`);
    updateConnectionStatus(connected, newDataSource);
  };

  // Wrap reconnect to update state on success
  const handleReconnect = async () => {
    console.log("[useIBKRConnectionStatus] Reconnect requested at", new Date().toISOString());
    const success = await reconnect();
    
    if (success) {
      console.log("[useIBKRConnectionStatus] Reconnect successful");
      updateConnectionStatus(true, 'live'); // We'll get the actual value on next check
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
    reconnect: handleReconnect,
    lastSuccessfulConnection,
    lastCheckTime
  };
}
