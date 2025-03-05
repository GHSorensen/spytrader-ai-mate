
import { useCallback } from 'react';
import { ConnectionDiagnostics, ConnectionHistoryEvent } from './types';

/**
 * Hook for generating detailed diagnostics information
 */
export function useDiagnostics() {
  /**
   * Generate detailed diagnostics information
   */
  const getDetailedDiagnostics = useCallback((diagnosticInfo?: {
    isConnected?: boolean;
    dataSource?: 'live' | 'delayed' | 'mock';
    connectionDiagnostics?: ConnectionDiagnostics | null;
    reconnectAttempts?: number;
    isReconnecting?: boolean;
    connectionLostTime?: Date | null;
    connectionHistory?: ConnectionHistoryEvent[];
  }) => {
    return {
      status: {
        isConnected: diagnosticInfo?.isConnected,
        dataSource: diagnosticInfo?.dataSource,
        reconnectAttempts: diagnosticInfo?.reconnectAttempts || 0,
        isReconnecting: diagnosticInfo?.isReconnecting || false,
        connectionLostTime: diagnosticInfo?.connectionLostTime?.toISOString(),
        currentTime: new Date().toISOString()
      },
      connectionDiagnostics: diagnosticInfo?.connectionDiagnostics || null,
      connectionHistory: diagnosticInfo?.connectionHistory?.map(event => ({
        ...event,
        timestamp: event.timestamp.toISOString()
      })) || [],
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  }, []);
  
  return {
    getDetailedDiagnostics
  };
}
