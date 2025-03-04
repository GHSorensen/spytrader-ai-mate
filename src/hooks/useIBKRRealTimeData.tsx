
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyMarketData } from '@/lib/types/spy';
import { toast } from 'sonner';

// Polling interval for real-time data in milliseconds
const POLLING_INTERVAL = 3000; 

export const useIBKRRealTimeData = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'delayed' | 'mock'>('mock');
  const queryClient = useQueryClient();

  // Check connection status and set appropriate flags
  const checkConnection = useCallback(async () => {
    try {
      const provider = getDataProvider();
      const connected = provider.isConnected();
      
      if (connected) {
        setIsConnected(true);
        // Check if data is live or delayed
        const status = (provider as any).status || { quotesDelayed: true };
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
      } else {
        setIsConnected(false);
        setDataSource('mock');
      }
    } catch (error) {
      console.error("Error checking IBKR connection:", error);
      setIsConnected(false);
      setDataSource('mock');
    }
  }, []);

  // Effect to check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Market data query with polling for real-time updates
  const marketDataQuery = useQuery({
    queryKey: ['marketData'],
    queryFn: async () => {
      try {
        const provider = getDataProvider();
        const data = await provider.getMarketData();
        return data;
      } catch (error) {
        console.error("Error fetching market data:", error);
        throw error;
      }
    },
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
  });

  // Option chain query with polling
  const optionChainQuery = useQuery({
    queryKey: ['optionChain', 'SPY'],
    queryFn: async () => {
      try {
        const provider = getDataProvider();
        const data = await provider.getOptionChain('SPY');
        return data;
      } catch (error) {
        console.error("Error fetching option chain:", error);
        throw error;
      }
    },
    refetchInterval: POLLING_INTERVAL * 2, // Less frequent than market data
    enabled: isConnected, // Only fetch if connected
  });

  // Manually trigger a refresh of all data
  const refreshAllData = useCallback(() => {
    try {
      queryClient.invalidateQueries({ queryKey: ['marketData'] });
      queryClient.invalidateQueries({ queryKey: ['optionChain'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['accountData'] });
      toast.success("Refreshing market data...");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  }, [queryClient]);

  // Reconnect to IBKR if connection was lost
  const reconnect = useCallback(async () => {
    try {
      toast.info("Reconnecting to Interactive Brokers...");
      const provider = getDataProvider();
      const connected = await provider.connect();
      
      if (connected) {
        setIsConnected(true);
        const status = (provider as any).status || { quotesDelayed: true };
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
        toast.success("Successfully reconnected to Interactive Brokers");
        refreshAllData();
      } else {
        setIsConnected(false);
        setDataSource('mock');
        toast.error("Failed to reconnect to Interactive Brokers");
      }
    } catch (error) {
      console.error("Error reconnecting to IBKR:", error);
      setIsConnected(false);
      setDataSource('mock');
      toast.error(`Reconnection error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [refreshAllData]);

  return {
    marketData: marketDataQuery.data as SpyMarketData | undefined,
    options: optionChainQuery.data || [],
    isLoading: marketDataQuery.isLoading || optionChainQuery.isLoading,
    isError: marketDataQuery.isError || optionChainQuery.isError,
    isConnected,
    dataSource,
    refreshAllData,
    reconnect,
    lastUpdated: marketDataQuery.dataUpdatedAt ? new Date(marketDataQuery.dataUpdatedAt) : undefined
  };
};
