
import { useIBKRDataOperations } from './ibkr/data/useIBKRDataOperations';
import { useIBKRRetryOperations } from './ibkr/retry/useIBKRRetryOperations';
import { useIBKRConnection } from './ibkr/connection/useIBKRConnection';
import { useIBKRErrorHandling } from './ibkr/errors/useIBKRErrorHandling';
import { useIBKRCombinedStatus } from './ibkr/status/useIBKRCombinedStatus';
import { useIBKRDataRefreshOperations } from './ibkr/refresh/useIBKRDataRefreshOperations';
import { useIBKRConnectionCheck } from './ibkr/useIBKRConnectionCheck';
import { SpyMarketData, SpyOption } from '@/lib/types/spy';

/**
 * Hook to provide consolidated access to IBKR real-time data
 * including market data, options, and connection status
 */
export const useIBKRRealTimeData = () => {
  // Get data operations
  const {
    marketData,
    options,
    marketDataLoading,
    optionsLoading,
    marketDataError,
    optionsError,
    marketDataErrorDetails,
    optionsErrorDetails,
    isMarketDataFetching,
    isOptionsFetching,
    refetchMarketData,
    refetchOptions,
    lastUpdated
  } = useIBKRDataOperations();

  // Get connection operations
  const {
    isConnected,
    dataSource,
    connectionDiagnostics,
    reconnect
  } = useIBKRConnection();

  // Get error handling
  const {
    internalErrors,
    setInternalErrors,
    getActiveError
  } = useIBKRErrorHandling();

  // Get retry operations
  const {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError
  } = useIBKRRetryOperations();

  // Get data refresh operations
  const { refreshAllData } = useIBKRDataRefreshOperations({
    refetchMarketData,
    refetchOptions,
    executeWithRetry,
    setInternalErrors
  });

  // Get connection check operations with proper dependencies
  const { forceConnectionCheck } = useIBKRConnectionCheck(
    () => Promise.resolve({ connected: isConnected, quotesDelayed: dataSource !== 'live' }),
    executeWithRetry,
    setInternalErrors
  );

  // Get combined status
  const { isLoading, isFetching, isError } = useIBKRCombinedStatus({
    marketDataLoading,
    optionsLoading,
    isRetrying,
    marketDataError,
    optionsError,
    internalErrors,
    isMarketDataFetching,
    isOptionsFetching
  });

  // Get the most relevant error
  const activeError = getActiveError(lastError, marketDataErrorDetails, optionsErrorDetails);

  return {
    // Data
    marketData: marketData as SpyMarketData | null,
    options: options as SpyOption[] | [],
    
    // Status
    isConnected,
    dataSource,
    connectionDiagnostics,
    isLoading,
    isError,
    isFetching,
    retryCount,
    isRetrying,
    
    // Errors
    lastError: activeError,
    
    // Actions
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    
    // Timestamps
    lastUpdated
  };
};
