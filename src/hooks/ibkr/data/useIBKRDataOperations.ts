
import { useCallback } from 'react';
import { useIBKRMarketData } from '../useIBKRMarketData';
import { useIBKROptionChain } from '../useIBKROptionChain';
import { SpyMarketData, SpyOption } from '@/lib/types/spy';

/**
 * Hook that manages IBKR market and options data operations
 */
export const useIBKRDataOperations = () => {
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

  return {
    // Data
    marketData: marketData as SpyMarketData | null,
    options: options as SpyOption[] | [],
    
    // Status
    marketDataLoading,
    optionsLoading,
    marketDataError,
    optionsError,
    marketDataErrorDetails,
    optionsErrorDetails,
    isMarketDataFetching,
    isOptionsFetching,
    
    // Actions
    refetchMarketData,
    refetchOptions,
    
    // Timestamps
    lastUpdated
  };
};
