import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useIBKRConnectionStatus } from './useIBKRConnectionStatus';
import { useConnectionHistory } from './useConnectionHistory';
import { useReconnectLogic } from './useReconnectLogic';
import { useDiagnostics } from './useDiagnostics';
import { useConnectionLogger } from './useConnectionLogger';
import { UseIBKRConnectionMonitorOptions, UseIBKRConnectionMonitorReturn, DetailedDiagnostics } from './types';
import { logConnectionError, debugIBKRConnection } from './utils';

/**
 * Enhanced connection monitoring hook for IBKR integration
 * with improved logging and diagnostics
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

  // Track connection duration
  const [connectionDuration, setConnectionDuration] = useState<number | null>(null);
  const [connectionCheckCount, setConnectionCheckCount] = useState(0);

  // Use the basic connection status with enhanced logging
  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    checkConnection, 
    reconnect,
    lastSuccessfulConnection,
    lastCheckTime
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

  // Calculate connection duration when connection status changes
  useEffect(() => {
    if (isConnected && lastSuccessfulConnection) {
      const updateDuration = () => {
        const now = new Date();
        const durationMs = now.getTime() - lastSuccessfulConnection.getTime();
        setConnectionDuration(durationMs / 1000); // in seconds
      };
      
      updateDuration();
      const timer = setInterval(updateDuration, 1000);
      return () => clearInterval(timer);
    } else {
      setConnectionDuration(null);
    }
  }, [isConnected, lastSuccessfulConnection]);

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
  
  // Log whenever connection status changes
  useEffect(() => {
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
          connectionHistory,
          connectionDuration,
          connectionCheckCount,
          lastSuccessfulConnection,
          lastCheckTime
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
          connectionHistory,
          connectionDuration,
          connectionCheckCount,
          lastSuccessfulConnection,
          lastCheckTime
        }));
      }
    }
  }, [isConnected, isReconnecting, dataSource]);

  // Track connection status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({ isConnected, dataSource });
    }
    
    handleConnectionChange(isConnected, reconnectAttempts > 0);
    
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
  }, [isConnected, dataSource, onStatusChange, reconnectAttempts, handleConnectionChange, lastSuccessfulConnection]);

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
    setConnectionCheckCount(prev => prev + 1);
    
    try {
      await checkConnection();
      logInfo('Connection check completed', { 
        isConnected, 
        dataSource,
        checkCount: connectionCheckCount + 1
      });
    } catch (error) {
      logError('Error during forced connection check', error);
    }
  }, [checkConnection, isConnected, dataSource, connectionCheckCount]);

  // Get detailed diagnostics wrapper
  const getDiagnosticsWrapper = useCallback(() => {
    const diagnostics = getDetailedDiagnostics({
      isConnected,
      dataSource,
      connectionDiagnostics,
      reconnectAttempts,
      isReconnecting,
      connectionLostTime,
      connectionHistory,
      connectionDuration,
      connectionCheckCount,
      lastSuccessfulConnection,
      lastCheckTime
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
    connectionHistory,
    connectionDuration,
    connectionCheckCount,
    lastSuccessfulConnection,
    lastCheckTime
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
