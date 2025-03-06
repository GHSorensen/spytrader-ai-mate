
import { useCallback } from 'react';
import { useDiagnostics } from '../useDiagnostics';
import { useConnectionLogger } from '../useConnectionLogger';

/**
 * Hook for diagnostic information handling
 */
export function useDiagnosticsWrapper() {
  const { getDetailedDiagnostics } = useDiagnostics();
  const { logInfo } = useConnectionLogger();
  
  // Get detailed diagnostics wrapper
  const getDiagnosticsWithLogging = useCallback((data: {
    isConnected: boolean;
    dataSource: 'live' | 'delayed' | 'mock';
    connectionDiagnostics: any;
    reconnectAttempts: number;
    isReconnecting: boolean;
    connectionLostTime: Date | null;
    connectionHistory: any[];
    connectionDuration?: number | null;
    connectionCheckCount?: number;
    lastSuccessfulConnection?: Date | null;
    lastCheckTime?: Date | null;
  }) => {
    const diagnostics = getDetailedDiagnostics(data);
    logInfo('Generated detailed diagnostics', diagnostics);
    return diagnostics;
  }, [getDetailedDiagnostics, logInfo]);

  return {
    getDiagnosticsWithLogging
  };
}
