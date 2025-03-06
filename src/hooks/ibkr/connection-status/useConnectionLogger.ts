
import { useState, useCallback } from 'react';

export interface ConnectionLogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

/**
 * Hook for detailed connection logging
 */
export function useConnectionLogger() {
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLogEntry[]>([]);
  
  const logInfo = useCallback((message: string, data?: any) => {
    console.log(`[IBKR Connection] ${message}`, data || '');
    setConnectionLogs(prev => [
      ...prev,
      { timestamp: new Date(), level: 'info', message, data }
    ]);
  }, []);
  
  const logWarning = useCallback((message: string, data?: any) => {
    console.warn(`[IBKR Connection] ${message}`, data || '');
    setConnectionLogs(prev => [
      ...prev,
      { timestamp: new Date(), level: 'warning', message, data }
    ]);
  }, []);
  
  const logError = useCallback((message: string, data?: any) => {
    console.error(`[IBKR Connection] ${message}`, data || '');
    setConnectionLogs(prev => [
      ...prev,
      { timestamp: new Date(), level: 'error', message, data }
    ]);
  }, []);
  
  const logSuccess = useCallback((message: string, data?: any) => {
    console.log(`[IBKR Connection] ✓ ${message}`, data || '');
    setConnectionLogs(prev => [
      ...prev,
      { timestamp: new Date(), level: 'success', message, data }
    ]);
  }, []);
  
  const clearLogs = useCallback(() => {
    setConnectionLogs([]);
  }, []);
  
  return {
    connectionLogs,
    logInfo,
    logWarning,
    logError,
    logSuccess,
    clearLogs
  };
}
