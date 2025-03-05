
import { useCallback } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { ConnectionHistoryEvent } from './types';

/**
 * Hook to provide detailed diagnostics information
 */
export function useDiagnostics() {
  const getDetailedDiagnostics = useCallback((
    params: {
      isConnected: boolean;
      dataSource: string;
      connectionDiagnostics: any;
      reconnectAttempts: number;
      isReconnecting: boolean;
      connectionLostTime: Date | null;
      connectionHistory: ConnectionHistoryEvent[];
    }
  ) => {
    const {
      isConnected,
      dataSource,
      connectionDiagnostics,
      reconnectAttempts,
      isReconnecting,
      connectionLostTime,
      connectionHistory
    } = params;
    
    try {
      const provider = getDataProvider();
      const providerDiagnostics = provider && typeof (provider as any).getDiagnostics === 'function' 
        ? (provider as any).getDiagnostics() 
        : { status: 'unknown', type: provider?.constructor.name };
      
      return {
        isConnected,
        dataSource,
        connectionDiagnostics,
        reconnectAttempts,
        isReconnecting,
        connectionLostTime,
        connectionHistory: connectionHistory.slice(-10), // Last 10 events
        provider: providerDiagnostics,
        browser: {
          userAgent: navigator.userAgent,
          online: navigator.onLine,
          language: navigator.language,
          platform: navigator.platform,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
    } catch (error) {
      console.error('[useDiagnostics] Error getting diagnostics:', error);
      return {
        error: 'Failed to get diagnostics',
        isConnected,
        dataSource
      };
    }
  }, []);

  return { getDetailedDiagnostics };
}
