
import { useIBKRConnectionStatus } from '../useIBKRConnectionStatus';
import { useIBKRConnectionCheck } from '../useIBKRConnectionCheck';

/**
 * Hook that manages IBKR connection status and related operations
 */
export const useIBKRConnection = () => {
  // Get connection status from IBKR
  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    checkConnection, 
    reconnect 
  } = useIBKRConnectionStatus();

  // Connection check operations
  const { forceConnectionCheck } = useIBKRConnectionCheck(
    checkConnection,
    () => Promise.resolve(null), // Stub for executeWithRetry, will be replaced
    () => {} // Stub for setInternalErrors, will be replaced
  );

  return {
    isConnected,
    dataSource,
    connectionDiagnostics,
    checkConnection,
    reconnect,
    forceConnectionCheck
  };
};
