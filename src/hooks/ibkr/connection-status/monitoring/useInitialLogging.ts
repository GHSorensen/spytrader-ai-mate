
import { useEffect } from 'react';
import { debugIBKRConnection } from '../utils';

/**
 * Hook for initial connection logging and debugging
 */
export function useInitialLogging(
  isConnected: boolean,
  dataSource: 'live' | 'delayed' | 'mock',
  autoReconnect: boolean,
  maxReconnectAttempts: number,
  reconnectInterval: number,
  logInfo: (message: string, data?: any) => void
) {
  // Log initial state on mount
  useEffect(() => {
    logInfo('Connection monitor initialized', { 
      isConnected, 
      dataSource,
      autoReconnect,
      maxReconnectAttempts,
      reconnectInterval
    });
    
    // Check for IBKR configuration on mount
    const config = localStorage.getItem('ibkr-config');
    logInfo('IBKR configuration status', {
      exists: !!config,
      configContent: config ? JSON.parse(config) : null
    });
    
    // Initial debug dump
    debugIBKRConnection();
    
    return () => {
      logInfo('Connection monitor unmounted');
    };
  }, []);
  
  return {};
}
