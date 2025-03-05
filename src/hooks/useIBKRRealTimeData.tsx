
import { useState } from 'react';
import { useIBKRConnectionStatus } from './ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from './ibkr/useIBKRMarketData';
import { useIBKROptionChain } from './ibkr/useIBKROptionChain';
import { useIBKRRetryPolicy } from './ibkr/useIBKRRetryPolicy';
import { useIBKRDataRefresh } from './ibkr/useIBKRDataRefresh';
import { useIBKRConnectionCheck } from './ibkr/useIBKRConnectionCheck';
import { useIBKRErrorHandler } from './ibkr/useIBKRErrorHandler';
import { useIBKRStatusCombiner } from './ibkr/useIBKRStatusCombiner';
import { SpyMarketData, SpyOption } from '@/lib/types/spy';

/**
 * Hook to provide consolidated access to IBKR real-time data
 * including market data, options, and connection status
 */
export const useIBKRRealTimeData = () => {
  // Get connection status from IBKR
  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics, 
    checkConnection, 
    reconnect 
  } = useIBKRConnectionStatus();

  // Get market data from IBKR with optimized caching
  const { 
    marketData, 
    isLoading: marketDataLoading, 
    isError: marketDataError,
    error: marketDataErrorDetails,
    lastUpdated,
    refetch: refetchMarketData,
    isFetching: isMarketDataFetching
  } = useIBKRMarketData({
    staleTime: 15000,        // Data considered stale after 15 seconds
    cacheTime: 300000,       // Cache for 5 minutes
    pollingInterval: 30000,  // Poll every 30 seconds
  });

  // Get options data from IBKR with optimized caching
  const { 
    options, 
    isLoading: optionsLoading, 
    isError: optionsError,
    error: optionsErrorDetails,
    refetch: refetchOptions,
    isFetching: isOptionsFetching
  } = useIBKROptionChain({ 
    symbol: 'SPY',
    staleTime: 60000,        // Options data stays fresh for 1 minute
    cacheTime: 600000,       // Cache for 10 minutes 
    refetchInterval: 60000,  // Refetch every minute
  });

  // Setup retry policy for data operations
  const {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError
  } = useIBKRRetryPolicy({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 1.5,
    retryOnCodes: [429, 503, 504]
  });

  // Error handling
  const { internalErrors, setInternalErrors, getActiveError } = useIBKRErrorHandler();

  // Data refresh operations
  const { refreshAllData } = useIBKRDataRefresh(
    refetchMarketData,
    refetchOptions,
    executeWithRetry,
    setInternalErrors
  );

  // Connection check operations
  const { forceConnectionCheck } = useIBKRConnectionCheck(
    checkConnection,
    executeWithRetry,
    setInternalErrors
  );

  // Status combining
  const { isLoading, isFetching, isError } = useIBKRStatusCombiner({
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
