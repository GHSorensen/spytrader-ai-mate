
import { useState, useCallback } from 'react';
import { useIBKRConnectionStatus } from './ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from './ibkr/useIBKRMarketData';
import { useIBKROptionChain } from './ibkr/useIBKROptionChain';
import { useIBKRRetryPolicy } from './ibkr/useIBKRRetryPolicy';
import { SpyMarketData, SpyOption } from '@/lib/types/spy';
import { logError } from '@/lib/errorMonitoring';

/**
 * Hook to provide consolidated access to IBKR real-time data
 * including market data, options, and connection status
 */
export const useIBKRRealTimeData = () => {
  // Track any internal errors in state
  const [internalErrors, setInternalErrors] = useState<Error[]>([]);

  // Get connection status from IBKR
  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    checkConnection, 
    reconnect 
  } = useIBKRConnectionStatus();

  // Get market data from IBKR
  const { 
    marketData, 
    isLoading: marketDataLoading, 
    isError: marketDataError,
    lastUpdated,
    refetch: refetchMarketData 
  } = useIBKRMarketData();

  // Get options data from IBKR
  const { 
    options, 
    isLoading: optionsLoading, 
    isError: optionsError,
    refetch: refetchOptions 
  } = useIBKROptionChain({ symbol: 'SPY' });

  // Setup retry policy for data operations
  const {
    executeWithRetry,
    isRetrying,
    retryCount
  } = useIBKRRetryPolicy({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 1.5,
  });

  // Combine loading states
  const isLoading = marketDataLoading || optionsLoading || isRetrying;

  // Combine error states
  const isError = marketDataError || optionsError || internalErrors.length > 0;

  /**
   * Refresh all data from IBKR with retry capability
   * Handles errors gracefully to ensure all data sources are attempted
   * even if one fails
   */
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all IBKR data sources");
    const refreshErrors: Error[] = [];
    
    try {
      // Attempt to refresh market data with retry policy
      await executeWithRetry(
        () => refetchMarketData(),
        { 
          component: 'useIBKRRealTimeData', 
          method: 'refreshAllData',
          subMethod: 'refetchMarketData'
        }
      );
    } catch (error) {
      console.error("Error refreshing market data:", error);
      if (error instanceof Error) {
        refreshErrors.push(error);
        // No need to log here as executeWithRetry already logs errors
      }
    }
    
    try {
      // Attempt to refresh options data with retry policy
      await executeWithRetry(
        () => refetchOptions(),
        { 
          component: 'useIBKRRealTimeData', 
          method: 'refreshAllData',
          subMethod: 'refetchOptions'
        }
      );
    } catch (error) {
      console.error("Error refreshing options data:", error);
      if (error instanceof Error) {
        refreshErrors.push(error);
        // No need to log here as executeWithRetry already logs errors
      }
    }
    
    if (refreshErrors.length > 0) {
      setInternalErrors(prev => [...prev, ...refreshErrors]);
    }
  }, [refetchMarketData, refetchOptions, executeWithRetry]);

  /**
   * Force a connection check with IBKR with retry capability
   * Useful when connection status might be stale
   */
  const forceConnectionCheck = useCallback(() => {
    console.log("Forcing IBKR connection check");
    try {
      executeWithRetry(
        async () => {
          checkConnection();
          return true;
        },
        { 
          component: 'useIBKRRealTimeData', 
          method: 'forceConnectionCheck'
        }
      );
    } catch (error) {
      console.error("Error checking connection:", error);
      if (error instanceof Error) {
        setInternalErrors(prev => [...prev, error]);
      }
    }
  }, [checkConnection, executeWithRetry]);

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
    retryCount,
    isRetrying,
    
    // Actions
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    
    // Timestamps
    lastUpdated
  };
};
