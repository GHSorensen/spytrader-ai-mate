
import { useState, useCallback } from 'react';
import { useIBKRConnectionStatus } from './ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from './ibkr/useIBKRMarketData';
import { useIBKROptionChain } from './ibkr/useIBKROptionChain';
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

  // Get options data from IBKR - fix here: pass required symbol parameter
  const { 
    options, 
    isLoading: optionsLoading, 
    isError: optionsError,
    refetch: refetchOptions 
  } = useIBKROptionChain({ symbol: 'SPY' });  // Adding required symbol parameter

  // Combine loading states
  const isLoading = marketDataLoading || optionsLoading;

  // Combine error states
  const isError = marketDataError || optionsError || internalErrors.length > 0;

  /**
   * Refresh all data from IBKR
   * Handles errors gracefully to ensure all data sources are attempted
   * even if one fails
   */
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all IBKR data sources");
    const refreshErrors: Error[] = [];
    
    try {
      // Attempt to refresh market data
      await refetchMarketData();
    } catch (error) {
      console.error("Error refreshing market data:", error);
      if (error instanceof Error) {
        refreshErrors.push(error);
        // Log the error to monitoring system
        logError(error, { 
          component: 'useIBKRRealTimeData', 
          method: 'refreshAllData',
          subMethod: 'refetchMarketData'
        });
      }
    }
    
    try {
      // Attempt to refresh options data
      await refetchOptions();
    } catch (error) {
      console.error("Error refreshing options data:", error);
      if (error instanceof Error) {
        refreshErrors.push(error);
        // Log the error to monitoring system
        logError(error, { 
          component: 'useIBKRRealTimeData', 
          method: 'refreshAllData',
          subMethod: 'refetchOptions'
        });
      }
    }
    
    if (refreshErrors.length > 0) {
      setInternalErrors(prev => [...prev, ...refreshErrors]);
    }
  }, [refetchMarketData, refetchOptions]);

  /**
   * Force a connection check with IBKR
   * Useful when connection status might be stale
   */
  const forceConnectionCheck = useCallback(() => {
    console.log("Forcing IBKR connection check");
    try {
      checkConnection();
    } catch (error) {
      console.error("Error checking connection:", error);
      if (error instanceof Error) {
        setInternalErrors(prev => [...prev, error]);
        // Log the error to monitoring system
        logError(error, { 
          component: 'useIBKRRealTimeData', 
          method: 'forceConnectionCheck'
        });
      }
    }
  }, [checkConnection]);

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
    
    // Actions
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    
    // Timestamps
    lastUpdated
  };
};
