
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useIBKRConnectionStatus } from './useIBKRConnectionStatus';
import { useConnectionHistory } from './useConnectionHistory';
import { useReconnectLogic } from './useReconnectLogic';
import { useDiagnostics } from './useDiagnostics';
import { useConnectionLogger } from './useConnectionLogger';
import { UseIBKRConnectionMonitorOptions, UseIBKRConnectionMonitorReturn } from './types';
import { logConnectionError } from './utils';

/**
 * Enhanced connection monitoring hook for IBKR integration
 * with improved logging
 */
export function useIBKRConnectionMonitor(
  options: UseIBKRConnectionMonitorOptions = {}
): UseIBKRConnectionMonitorReturn {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 30000, // 30 seconds
    onStatusChange
  } = options;

  // Set up connection logger
  const {
    connectionLogs,
    logInfo,
    logWarning,
    logError,
    logSuccess
  } = useConnectionLogger();

  // Use the basic connection status
  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    checkConnection, 
    reconnect 
  } = useIBKRConnectionStatus();
  
  // Track connection history
  const {
    connectionHistory,
    connectionLostTime,
    handleConnectionChange,
    recordReconnectAttempt
  } = useConnectionHistory();
  
  // Reconnection logic
  const {
    isReconnecting,
    reconnectAttempts,
    resetReconnectAttempts
  } = useReconnectLogic(
    isConnected,
    connectionLostTime,
    reconnect,
    {
      autoReconnect,
      maxReconnectAttempts,
      reconnectInterval,
      onAttempt: (attempt, max) => {
        logInfo(`Reconnect attempt ${attempt} of ${max}`);
        recordReconnectAttempt(attempt, max);
      },
      onFailure: (attempt) => {
        logError(`Reconnection failed after ${attempt} attempt(s)`);
        recordReconnectAttempt(attempt, maxReconnectAttempts, false);
      }
    }
  );
  
  // Diagnostics
  const { getDetailedDiagnostics } = useDiagnostics();

  // Log initial state on mount
  useEffect(() => {
    logInfo('Connection monitor initialized', { 
      isConnected, 
      dataSource,
      autoReconnect,
      maxReconnectAttempts,
      reconnectInterval
    });
    
    return () => {
      logInfo('Connection monitor unmounted');
    };
  }, []);
  
  // Log whenever connection status changes
  useEffect(() => {
    if (isConnected) {
      logSuccess(`Connected to IBKR (${dataSource} data)`, { dataSource });
    } else if (isReconnecting) {
      logWarning('Disconnected from IBKR, attempting to reconnect', { reconnectAttempts });
    } else {
      logError('Disconnected from IBKR', { connectionLostTime });
    }
  }, [isConnected, isReconnecting, dataSource]);

  // Track connection status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({ isConnected, dataSource });
    }
    
    handleConnectionChange(isConnected, reconnectAttempts > 0);
  }, [isConnected, dataSource, onStatusChange, reconnectAttempts, handleConnectionChange]);

  // Manual reconnect handler - reset attempt counter and try immediately
  const handleManualReconnect = useCallback(async (): Promise<void> => {
    try {
      logInfo('Manual reconnect attempt initiated');
      toast.info("Attempting to reconnect...");
      
      // Record attempt
      recordReconnectAttempt(0, maxReconnectAttempts);
      
      const success = await reconnect();
      
      if (success) {
        logSuccess('Manual reconnect successful');
        toast.success("Successfully reconnected");
        resetReconnectAttempts();
      } else {
        logError('Manual reconnect failed');
        toast.error("Reconnection Failed", {
          description: "Could not establish connection. Please check your network and IBKR credentials.",
        });
        
        // Record failure
        recordReconnectAttempt(1, maxReconnectAttempts, false);
      }
    } catch (error) {
      logError('Error during manual reconnect', error);
      
      toast.error("Reconnection Error", {
        description: error instanceof Error ? error.message : "Unknown error during reconnection",
      });
      
      logConnectionError(error, {
        service: 'useIBKRConnectionMonitor',
        method: 'handleManualReconnect'
      });
    }
  }, [reconnect, resetReconnectAttempts, recordReconnectAttempt, maxReconnectAttempts]);

  // Force connection check with logging
  const forceConnectionCheck = useCallback(async (): Promise<void> => {
    logInfo('Forcing connection check');
    try {
      await checkConnection();
      logInfo('Connection check completed', { isConnected, dataSource });
    } catch (error) {
      logError('Error during forced connection check', error);
    }
  }, [checkConnection, isConnected, dataSource]);

  // Get detailed diagnostics wrapper
  const getDiagnosticsWrapper = useCallback(() => {
    const diagnostics = getDetailedDiagnostics({
      isConnected,
      dataSource,
      connectionDiagnostics,
      reconnectAttempts,
      isReconnecting,
      connectionLostTime,
      connectionHistory
    });
    
    logInfo('Generated detailed diagnostics', diagnostics);
    return diagnostics;
  }, [
    getDetailedDiagnostics,
    isConnected,
    dataSource,
    connectionDiagnostics,
    reconnectAttempts,
    isReconnecting,
    connectionLostTime,
    connectionHistory
  ]);

  return {
    isConnected,
    dataSource,
    isReconnecting,
    reconnectAttempts,
    connectionLostTime,
    connectionHistory,
    connectionLogs,
    handleManualReconnect,
    forceConnectionCheck,
    getDetailedDiagnostics: getDiagnosticsWrapper
  };
}
