
import { useState, useCallback } from 'react';
import { useIBKRConnectionStatus } from './ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from './ibkr/useIBKRMarketData';
import { useIBKROptionChain } from './ibkr/useIBKROptionChain';
import { useIBKRRetryPolicy } from './ibkr/useIBKRRetryPolicy';
import { SpyMarketData, SpyOption } from '@/lib/types/spy';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { getProviderErrorContext } from '@/services/dataProviders/interactiveBrokers/utils/providerUtils';

/**
 * Hook to provide consolidated access to IBKR real-time data
 * including market data, options, and connection status
 */
export const useIBKRRealTimeData = () => {
  // Track any internal errors in state
  const [internalErrors, setInternalErrors] = useState<ClassifiedError[]>([]);

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

  // Combine loading states
  const isLoading = marketDataLoading || optionsLoading || isRetrying;
  const isFetching = isMarketDataFetching || isOptionsFetching || isRetrying;

  // Combine error states
  const isError = marketDataError || optionsError || internalErrors.length > 0;
  
  // Get the most relevant error to display
  const getActiveError = useCallback((): ClassifiedError | null => {
    if (lastError) return lastError;
    if (marketDataErrorDetails) return marketDataErrorDetails as ClassifiedError;
    if (optionsErrorDetails) return optionsErrorDetails as ClassifiedError;
    if (internalErrors.length > 0) return internalErrors[internalErrors.length - 1];
    return null;
  }, [lastError, marketDataErrorDetails, optionsErrorDetails, internalErrors]);

  /**
   * Refresh all data from IBKR with retry capability
   * Handles errors gracefully to ensure all data sources are attempted
   * even if one fails
   */
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all IBKR data sources");
    const refreshErrors: ClassifiedError[] = [];
    
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
      // Classify the error for better handling
      const provider = getDataProvider();
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRRealTimeData',
        method: 'refreshAllData.marketData',
        connectionMethod,
        paperTrading
      });
      refreshErrors.push(classifiedError);
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
      // Classify the error for better handling
      const provider = getDataProvider();
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRRealTimeData',
        method: 'refreshAllData.options',
        connectionMethod,
        paperTrading
      });
      refreshErrors.push(classifiedError);
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
      // Classify the error for better handling
      const provider = getDataProvider();
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRRealTimeData',
        method: 'forceConnectionCheck',
        connectionMethod,
        paperTrading
      });
      setInternalErrors(prev => [...prev, classifiedError]);
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
    isFetching,
    retryCount,
    isRetrying,
    
    // Errors
    lastError: getActiveError(),
    
    // Actions
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    
    // Timestamps
    lastUpdated
  };
};
