
import { useCallback } from 'react';
import { ConnectionDiagnostics, ConnectionHistoryEvent, DetailedDiagnostics } from './types';
import { debugIBKRConnection } from './utils';

/**
 * Hook for generating detailed diagnostics information
 */
export function useDiagnostics() {
  const getDetailedDiagnostics = useCallback((data?: {
    isConnected: boolean;
    dataSource: 'live' | 'delayed' | 'mock';
    connectionDiagnostics?: ConnectionDiagnostics | null;
    connectionHistory?: ConnectionHistoryEvent[];
    reconnectAttempts?: number;
    isReconnecting?: boolean;
    connectionLostTime?: Date | null;
    connectionDuration?: number | null;
    connectionCheckCount?: number;
    lastSuccessfulConnection?: Date | null;
    lastCheckTime?: Date | null;
  }): DetailedDiagnostics => {
    // Record all the diagnostic info we can gather
    const diagnostics: DetailedDiagnostics = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      connection: {
        isConnected: data?.isConnected || false,
        dataSource: data?.dataSource || 'mock',
        lastChecked: new Date().toISOString(),
        provider: data?.connectionDiagnostics?.providerType || 'Unknown',
        providerStatus: data?.connectionDiagnostics?.status || null,
        reconnectAttempts: data?.reconnectAttempts || 0,
        isReconnecting: data?.isReconnecting || false,
        connectionLostTime: data?.connectionLostTime?.toISOString() || null,
        lastError: data?.connectionDiagnostics?.error || null
      },
      history: data?.connectionHistory || [],
      detailedProvider: null as any,
      connectionDuration: data?.connectionDuration,
      connectionCheckCount: data?.connectionCheckCount,
      lastSuccessfulConnection: data?.lastSuccessfulConnection,
      lastCheckTime: data?.lastCheckTime
    };
    
    // Run debug function to capture detailed provider state
    debugIBKRConnection();
    
    return diagnostics;
  }, []);
  
  return { getDetailedDiagnostics };
}
