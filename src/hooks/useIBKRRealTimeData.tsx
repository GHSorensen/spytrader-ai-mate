
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
      console.log("[useIBKRRealTimeData] Checking IBKR connection status...");
      const provider = getDataProvider();
      console.log("[useIBKRRealTimeData] Data provider:", provider?.constructor.name);
      
      const connected = provider.isConnected();
      console.log("[useIBKRRealTimeData] Provider connected:", connected);
      
      if (connected) {
        setIsConnected(true);
        // Check if data is live or delayed
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useIBKRRealTimeData] Provider status:", JSON.stringify(status, null, 2));
        
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
        console.log("[useIBKRRealTimeData] Data source set to:", status.quotesDelayed ? 'delayed' : 'live');
      } else {
        console.log("[useIBKRRealTimeData] Provider not connected");
        setIsConnected(false);
        setDataSource('mock');
      }
    } catch (error) {
      console.error("[useIBKRRealTimeData] Error checking IBKR connection:", error);
      setIsConnected(false);
      setDataSource('mock');
    }
  }, []);

  // Effect to check connection on mount
  useEffect(() => {
    console.log("[useIBKRRealTimeData] Hook mounted, checking connection");
    checkConnection();
  }, [checkConnection]);

  // Market data query with polling for real-time updates
  const marketDataQuery = useQuery({
    queryKey: ['marketData'],
    queryFn: async () => {
      try {
        console.log("[useIBKRRealTimeData] Fetching market data...");
        const provider = getDataProvider();
        console.log("[useIBKRRealTimeData] Using provider:", provider?.constructor.name);
        
        console.log("[useIBKRRealTimeData] Calling provider.getMarketData()");
        const startTime = Date.now();
        const data = await provider.getMarketData();
        const endTime = Date.now();
        
        console.log(`[useIBKRRealTimeData] Market data fetched in ${endTime - startTime}ms`);
        console.log("[useIBKRRealTimeData] Data:", JSON.stringify(data, null, 2));
        
        return data;
      } catch (error) {
        console.error("[useIBKRRealTimeData] Error fetching market data:", error);
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
        console.log("[useIBKRRealTimeData] Fetching option chain for SPY...");
        const provider = getDataProvider();
        console.log("[useIBKRRealTimeData] Using provider:", provider?.constructor.name);
        
        console.log("[useIBKRRealTimeData] Calling provider.getOptionChain('SPY')");
        const startTime = Date.now();
        const data = await provider.getOptionChain('SPY');
        const endTime = Date.now();
        
        console.log(`[useIBKRRealTimeData] Option chain fetched in ${endTime - startTime}ms`);
        console.log("[useIBKRRealTimeData] Received options count:", data?.length || 0);
        
        return data;
      } catch (error) {
        console.error("[useIBKRRealTimeData] Error fetching option chain:", error);
        throw error;
      }
    },
    refetchInterval: POLLING_INTERVAL * 2, // Less frequent than market data
    enabled: isConnected, // Only fetch if connected
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

  // Reconnect to IBKR if connection was lost
  const reconnect = useCallback(async () => {
    try {
      console.log("[useIBKRRealTimeData] Attempting to reconnect to IBKR");
      toast.info("Reconnecting to Interactive Brokers...");
      
      const provider = getDataProvider();
      console.log("[useIBKRRealTimeData] Using provider:", provider?.constructor.name);
      
      console.log("[useIBKRRealTimeData] Calling provider.connect()");
      const startTime = Date.now();
      const connected = await provider.connect();
      const endTime = Date.now();
      
      console.log(`[useIBKRRealTimeData] Connect call took ${endTime - startTime}ms, result:`, connected);
      
      if (connected) {
        setIsConnected(true);
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useIBKRRealTimeData] Provider status after reconnect:", JSON.stringify(status, null, 2));
        
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
        toast.success("Successfully reconnected to Interactive Brokers");
        refreshAllData();
      } else {
        console.log("[useIBKRRealTimeData] Failed to reconnect");
        setIsConnected(false);
        setDataSource('mock');
        toast.error("Failed to reconnect to Interactive Brokers");
      }
    } catch (error) {
      console.error("[useIBKRRealTimeData] Error reconnecting to IBKR:", error);
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
