
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useIBKRConnectionStatus } from './useIBKRConnectionStatus';
import { useConnectionHistory } from './useConnectionHistory';
import { useReconnectLogic } from './useReconnectLogic';
import { useDiagnostics } from './useDiagnostics';
import { UseIBKRConnectionMonitorOptions, UseIBKRConnectionMonitorReturn } from './types';
import { logConnectionError } from './utils';

/**
 * Enhanced connection monitoring hook for IBKR integration
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
      onAttempt: (attempt, max) => recordReconnectAttempt(attempt, max),
      onFailure: (attempt) => recordReconnectAttempt(attempt, maxReconnectAttempts, false)
    }
  );
  
  // Diagnostics
  const { getDetailedDiagnostics } = useDiagnostics();

  // Track connection status changes
  useCallback(() => {
    if (onStatusChange) {
      onStatusChange({ isConnected, dataSource });
    }
    
    handleConnectionChange(isConnected, reconnectAttempts > 0);
  }, [isConnected, dataSource, onStatusChange, reconnectAttempts, handleConnectionChange]);

  // Manual reconnect handler - reset attempt counter and try immediately
  const handleManualReconnect = useCallback(async (): Promise<void> => {
    try {
      console.log('[useIBKRConnectionMonitor] Manual reconnect attempt');
      toast.info("Attempting to reconnect...");
      
      // Record attempt
      recordReconnectAttempt(0, maxReconnectAttempts);
      
      const success = await reconnect();
      
      if (success) {
        console.log('[useIBKRConnectionMonitor] Manual reconnect successful');
        toast.success("Successfully reconnected");
        resetReconnectAttempts();
      } else {
        console.log('[useIBKRConnectionMonitor] Manual reconnect failed');
        toast.error("Reconnection Failed", {
          description: "Could not establish connection. Please check your network and IBKR credentials.",
        });
        
        // Record failure
        recordReconnectAttempt(1, maxReconnectAttempts, false);
      }
    } catch (error) {
      console.error('[useIBKRConnectionMonitor] Error during manual reconnect:', error);
      
      toast.error("Reconnection Error", {
        description: error instanceof Error ? error.message : "Unknown error during reconnection",
      });
      
      logConnectionError(error, {
        service: 'useIBKRConnectionMonitor',
        method: 'handleManualReconnect'
      });
    }
  }, [reconnect, resetReconnectAttempts, recordReconnectAttempt, maxReconnectAttempts]);

  // Get detailed diagnostics wrapper
  const getDiagnosticsWrapper = useCallback(() => {
    return getDetailedDiagnostics({
      isConnected,
      dataSource,
      connectionDiagnostics,
      reconnectAttempts,
      isReconnecting,
      connectionLostTime,
      connectionHistory
    });
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
    handleManualReconnect,
    forceConnectionCheck: checkConnection,
    getDetailedDiagnostics: getDiagnosticsWrapper
  };
}
