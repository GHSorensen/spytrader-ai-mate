
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useConnectionLogger } from '../useConnectionLogger';
import { useDiagnostics } from '../useDiagnostics';
import { logConnectionError } from '../utils';

/**
 * Hook for handling connection status changes
 */
export function useStatusChangeHandlers() {
  const {
    logInfo,
    logWarning,
    logError,
    logSuccess
  } = useConnectionLogger();
  
  const { getDetailedDiagnostics } = useDiagnostics();
  
  // Handler for status changes
  const handleStatusChange = useCallback((
    isConnected: boolean, 
    isReconnecting: boolean,
    dataSource: 'live' | 'delayed' | 'mock',
    connectionHistory: any[],
    reconnectAttempts: number,
    connectionLostTime: Date | null,
    lastSuccessfulConnection: Date | null,
    lastCheckTime: Date | null,
    connectionDiagnostics: any,
    onStatusChange?: (status: { isConnected: boolean; dataSource: 'live' | 'delayed' | 'mock' }) => void
  ) => {
    // Call external handler if provided
    if (onStatusChange) {
      onStatusChange({ isConnected, dataSource });
    }
    
    // Log connection status
    if (isConnected) {
      logSuccess(`Connected to IBKR (${dataSource} data)`, { 
        dataSource,
        lastSuccessfulConnection,
        lastCheckTime
      });
      
      // If we just connected, capture detailed diagnostics
      if (connectionHistory.length > 0 && connectionHistory[connectionHistory.length - 1].event === 'disconnected') {
        logInfo('Detailed diagnostics after reconnection', getDetailedDiagnostics({
          isConnected,
          dataSource,
          connectionDiagnostics,
          reconnectAttempts,
          isReconnecting,
          connectionLostTime,
          connectionHistory
        }));
      }
    } else if (isReconnecting) {
      logWarning('Disconnected from IBKR, attempting to reconnect', { 
        reconnectAttempts,
        connectionLostTime,
        lastCheckTime
      });
    } else {
      logError('Disconnected from IBKR', { 
        connectionLostTime,
        lastCheckTime
      });
      
      // Detailed info for disconnections
      if (connectionHistory.length > 0 && connectionHistory[connectionHistory.length - 1].event === 'connected') {
        logError('Detailed diagnostics after disconnection', getDetailedDiagnostics({
          isConnected,
          dataSource,
          connectionDiagnostics,
          reconnectAttempts,
          isReconnecting,
          connectionLostTime,
          connectionHistory
        }));
      }
    }
    
    // Log any brief connections (less than 10 seconds)
    if (!isConnected && lastSuccessfulConnection) {
      const connectionTime = new Date().getTime() - lastSuccessfulConnection.getTime();
      if (connectionTime < 10000) { // Less than 10 seconds
        logWarning(`Brief connection detected (${(connectionTime/1000).toFixed(1)}s)`, {
          connectedAt: lastSuccessfulConnection,
          disconnectedAt: new Date(),
          durationMs: connectionTime
        });
      }
    }
  }, []);
  
  return {
    handleStatusChange
  };
}
