
import { useCallback, useEffect } from 'react';
import { useIBKRConnectionStatus } from './useIBKRConnectionStatus';
import { useConnectionHistory } from './useConnectionHistory';
import { useReconnectLogic } from './useReconnectLogic';
import { useConnectionLogger } from './useConnectionLogger';
import { UseIBKRConnectionMonitorOptions, UseIBKRConnectionMonitorReturn } from './types';

// Import refactored modules
import { useConnectionState } from './monitoring/useConnectionState';
import { useStatusChangeHandlers } from './monitoring/useStatusChangeHandlers';
import { useConnectionActions } from './monitoring/useConnectionActions';
import { useDiagnosticsWrapper } from './monitoring/useDiagnosticsWrapper';
import { useInitialLogging } from './monitoring/useInitialLogging';

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

  // Connection state tracking
  const {
    connectionDuration,
    connectionCheckCount,
    incrementCheckCount,
    setupDurationTimer
  } = useConnectionState();

  // Use the basic connection status
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
  
  // Status change handling
  const { handleStatusChange } = useStatusChangeHandlers();
  
  // Connection actions
  const { handleManualReconnect, forceConnectionCheck } = useConnectionActions(
    reconnect,
    checkConnection,
    recordReconnectAttempt,
    resetReconnectAttempts,
    incrementCheckCount,
    logInfo,
    logError,
    logSuccess
  );
  
  // Diagnostics wrapper
  const { getDiagnosticsWithLogging } = useDiagnosticsWrapper();
  
  // Initial logging
  useInitialLogging(
    isConnected,
    dataSource,
    autoReconnect,
    maxReconnectAttempts,
    reconnectInterval,
    logInfo
  );

  // Calculate connection duration when connection status changes
  useEffect(() => {
    return setupDurationTimer(isConnected, lastSuccessfulConnection);
  }, [isConnected, lastSuccessfulConnection, setupDurationTimer]);

  // Log whenever connection status changes and handle connection history
  useEffect(() => {
    handleStatusChange(
      isConnected,
      isReconnecting,
      dataSource,
      connectionHistory,
      reconnectAttempts,
      connectionLostTime,
      lastSuccessfulConnection,
      lastCheckTime,
      connectionDiagnostics,
      onStatusChange
    );
    
    handleConnectionChange(isConnected, reconnectAttempts > 0);
    
  }, [isConnected, isReconnecting, dataSource, connectionHistory, reconnectAttempts, 
      connectionLostTime, handleStatusChange, handleConnectionChange]);

  // Get detailed diagnostics wrapper
  const getDetailedDiagnostics = useCallback(() => {
    return getDiagnosticsWithLogging({
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
  }, [
    getDiagnosticsWithLogging,
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
    getDetailedDiagnostics
  };
}
