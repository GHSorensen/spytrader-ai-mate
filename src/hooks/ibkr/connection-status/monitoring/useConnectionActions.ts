
import { useCallback } from 'react';
import { toast } from 'sonner';
import { logConnectionError } from '../utils';
import { useConnectionLogger } from '../useConnectionLogger';

/**
 * Hook for connection-related actions
 */
export function useConnectionActions(
  reconnect: () => Promise<boolean>,
  checkConnection: () => Promise<void>,
  recordReconnectAttempt: (attempt: number, maxAttempts: number, success?: boolean) => void,
  resetReconnectAttempts: () => void,
  incrementCheckCount: () => void,
  logInfo: (message: string, data?: any) => void,
  logError: (message: string, data?: any) => void,
  logSuccess: (message: string, data?: any) => void
) {
  // Manual reconnect handler - reset attempt counter and try immediately
  const handleManualReconnect = useCallback(async (): Promise<void> => {
    try {
      logInfo('Manual reconnect attempt initiated');
      toast.info("Attempting to reconnect...");
      
      // Record attempt
      recordReconnectAttempt(0, 5);
      
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
        recordReconnectAttempt(1, 5, false);
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
  }, [reconnect, resetReconnectAttempts, recordReconnectAttempt]);

  // Force connection check with logging
  const forceConnectionCheck = useCallback(async (): Promise<void> => {
    logInfo('Forcing connection check');
    incrementCheckCount();
    
    try {
      await checkConnection();
      logInfo('Connection check completed');
    } catch (error) {
      logError('Error during forced connection check', error);
    }
  }, [checkConnection, incrementCheckCount]);

  return {
    handleManualReconnect,
    forceConnectionCheck
  };
}
