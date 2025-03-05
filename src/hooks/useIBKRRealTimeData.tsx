
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useIBKRConnectionStatus } from './ibkr/useIBKRConnectionStatus';
import { useIBKRMarketData } from './ibkr/useIBKRMarketData';
import { useIBKROptionChain } from './ibkr/useIBKROptionChain';

// Polling intervals in milliseconds
const MARKET_DATA_POLLING_INTERVAL = 3000;
const OPTION_CHAIN_POLLING_INTERVAL = 6000;

export const useIBKRRealTimeData = () => {
  const queryClient = useQueryClient();
  
  // Use the refactored connection hook
  const { 
    isConnected, 
    dataSource, 
    connectionDiagnostics,
    checkConnection: forceConnectionCheck,
    reconnect 
  } = useIBKRConnectionStatus();
  
  // Use the market data hook with polling based on connection status
  const { 
    marketData,
    isLoading: isMarketDataLoading,
    isError: isMarketDataError,
    lastUpdated: marketDataLastUpdated,
    refetch: refetchMarketData
  } = useIBKRMarketData({
    enabled: true, // Always enabled to show at least mock data
    pollingInterval: MARKET_DATA_POLLING_INTERVAL
  });
  
  // Use the option chain hook for SPY with enabled based on connection status
  const {
    options,
    isLoading: isOptionsLoading,
    isError: isOptionsError,
    refetch: refetchOptions
  } = useIBKROptionChain({
    symbol: 'SPY',
    enabled: isConnected,
    pollingInterval: OPTION_CHAIN_POLLING_INTERVAL
  });

  // Manually trigger a refresh of all data
  const refreshAllData = useCallback(() => {
    try {
      console.log("[useIBKRRealTimeData] Manually refreshing all data");
      queryClient.invalidateQueries({ queryKey: ['marketData'] });
      queryClient.invalidateQueries({ queryKey: ['optionChain'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['accountData'] });
      toast.success("Refreshing market data...");
    } catch (error) {
      console.error("[useIBKRRealTimeData] Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  }, [queryClient]);

  return {
    // Data
    marketData,
    options,
    
    // Status
    isConnected,
    dataSource,
    connectionDiagnostics,
    isLoading: isMarketDataLoading || isOptionsLoading,
    isError: isMarketDataError || isOptionsError,
    
    // Actions
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    
    // Timestamps
    lastUpdated: marketDataLastUpdated
  };
};
