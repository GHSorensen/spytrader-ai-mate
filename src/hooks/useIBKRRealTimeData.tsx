
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
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<any>(null);
  const queryClient = useQueryClient();

  // Check connection status and set appropriate flags
  const checkConnection = useCallback(async () => {
    try {
      console.log("[useIBKRRealTimeData] Checking IBKR connection status...");
      const provider = getDataProvider();
      console.log("[useIBKRRealTimeData] Data provider:", provider?.constructor.name);
      
      // Capture diagnostics info
      const diagnostics: any = {
        timestamp: new Date().toISOString(),
        providerType: provider?.constructor.name || 'Unknown',
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      // Test if provider exists and has required methods
      if (!provider) {
        console.error("[useIBKRRealTimeData] No data provider available");
        diagnostics.error = "No data provider available";
        setConnectionDiagnostics(diagnostics);
        setIsConnected(false);
        setDataSource('mock');
        return;
      }
      
      // Check if isConnected method exists
      if (typeof provider.isConnected !== 'function') {
        console.error("[useIBKRRealTimeData] Provider missing isConnected method");
        diagnostics.error = "Provider missing isConnected method";
        setConnectionDiagnostics(diagnostics);
        setIsConnected(false);
        setDataSource('mock');
        return;
      }
      
      const connected = provider.isConnected();
      console.log("[useIBKRRealTimeData] Provider connected:", connected);
      diagnostics.connected = connected;
      
      if (connected) {
        setIsConnected(true);
        // Check if data is live or delayed
        const status = (provider as any).status || { quotesDelayed: true };
        console.log("[useIBKRRealTimeData] Provider status:", JSON.stringify(status, null, 2));
        diagnostics.status = status;
        
        setDataSource(status.quotesDelayed ? 'delayed' : 'live');
        console.log("[useIBKRRealTimeData] Data source set to:", status.quotesDelayed ? 'delayed' : 'live');
        diagnostics.dataSource = status.quotesDelayed ? 'delayed' : 'live';
      } else {
        console.log("[useIBKRRealTimeData] Provider not connected");
        setIsConnected(false);
        setDataSource('mock');
        diagnostics.dataSource = 'mock';
      }
      
      setConnectionDiagnostics(diagnostics);
    } catch (error) {
      console.error("[useIBKRRealTimeData] Error checking IBKR connection:", error);
      console.error("[useIBKRRealTimeData] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      setConnectionDiagnostics({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace"
      });
      setIsConnected(false);
      setDataSource('mock');
    }
  }, []);

  // Effect to check connection on mount
  useEffect(() => {
    console.log("[useIBKRRealTimeData] Hook mounted, checking connection");
    checkConnection();
    
    // Set up interval to periodically check connection
    const checkInterval = setInterval(() => {
      console.log("[useIBKRRealTimeData] Periodic connection check running");
      checkConnection();
    }, 30000); // Check every 30 seconds
    
    return () => {
      console.log("[useIBKRRealTimeData] Clearing connection check interval");
      clearInterval(checkInterval);
    };
  }, [checkConnection]);

  // Market data query with polling for real-time updates
  const marketDataQuery = useQuery({
    queryKey: ['marketData'],
    queryFn: async () => {
      try {
        console.log("[useIBKRRealTimeData] Fetching market data...");
        const provider = getDataProvider();
        console.log("[useIBKRRealTimeData] Using provider:", provider?.constructor.name);
        
        if (!provider) {
          console.error("[useIBKRRealTimeData] No data provider available for market data");
          throw new Error("No data provider available");
        }
        
        if (typeof provider.getMarketData !== 'function') {
          console.error("[useIBKRRealTimeData] Provider missing getMarketData method");
          throw new Error("Provider missing getMarketData method");
        }
        
        console.log("[useIBKRRealTimeData] Calling provider.getMarketData()");
        const startTime = Date.now();
        const data = await provider.getMarketData();
        const endTime = Date.now();
        
        console.log(`[useIBKRRealTimeData] Market data fetched in ${endTime - startTime}ms`);
        
        // Debug the returned data
        if (data) {
          console.log("[useIBKRRealTimeData] Received market data:", {
            spy: data.spy ? {
              price: data.spy.price,
              change: data.spy.change,
              updated: data.spy.updated
            } : 'Missing',
            vix: data.vix ? {
              price: data.vix.price,
              change: data.vix.change
            } : 'Missing',
            marketHours: data.marketHours,
            timestamp: data.timestamp
          });
        } else {
          console.warn("[useIBKRRealTimeData] Received null/undefined market data");
        }
        
        return data;
      } catch (error) {
        console.error("[useIBKRRealTimeData] Error fetching market data:", error);
        console.error("[useIBKRRealTimeData] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
        throw error;
      }
    },
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Option chain query with polling
  const optionChainQuery = useQuery({
    queryKey: ['optionChain', 'SPY'],
    queryFn: async () => {
      try {
        console.log("[useIBKRRealTimeData] Fetching option chain for SPY...");
        const provider = getDataProvider();
        console.log("[useIBKRRealTimeData] Using provider:", provider?.constructor.name);
        
        if (!provider) {
          console.error("[useIBKRRealTimeData] No data provider available for option chain");
          throw new Error("No data provider available");
        }
        
        if (typeof provider.getOptionChain !== 'function') {
          console.error("[useIBKRRealTimeData] Provider missing getOptionChain method");
          throw new Error("Provider missing getOptionChain method");
        }
        
        console.log("[useIBKRRealTimeData] Calling provider.getOptionChain('SPY')");
        const startTime = Date.now();
        const data = await provider.getOptionChain('SPY');
        const endTime = Date.now();
        
        console.log(`[useIBKRRealTimeData] Option chain fetched in ${endTime - startTime}ms`);
        console.log("[useIBKRRealTimeData] Received options count:", data?.length || 0);
        
        // Log a sample of the options if available
        if (data && data.length > 0) {
          console.log("[useIBKRRealTimeData] First 3 options sample:", 
            data.slice(0, 3).map(opt => ({
              strike: opt.strikePrice,
              type: opt.type,
              expiry: opt.expirationDate,
              bid: opt.bidPrice,
              ask: opt.askPrice
            }))
          );
        }
        
        return data;
      } catch (error) {
        console.error("[useIBKRRealTimeData] Error fetching option chain:", error);
        console.error("[useIBKRRealTimeData] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
        throw error;
      }
    },
    refetchInterval: POLLING_INTERVAL * 2, // Less frequent than market data
    enabled: isConnected, // Only fetch if connected
    retry: 2,
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

  // Force a connection check
  const forceConnectionCheck = useCallback(() => {
    console.log("[useIBKRRealTimeData] Forcing connection check");
    checkConnection();
  }, [checkConnection]);

  // Reconnect to IBKR if connection was lost
  const reconnect = useCallback(async () => {
    try {
      console.log("[useIBKRRealTimeData] Attempting to reconnect to IBKR");
      toast.info("Reconnecting to Interactive Brokers...");
      
      const provider = getDataProvider();
      console.log("[useIBKRRealTimeData] Using provider:", provider?.constructor.name);
      
      if (!provider) {
        console.error("[useIBKRRealTimeData] No data provider available for reconnection");
        toast.error("No data provider available for reconnection");
        return false;
      }
      
      if (typeof provider.connect !== 'function') {
        console.error("[useIBKRRealTimeData] Provider missing connect method");
        toast.error("Provider is missing connect method");
        return false;
      }
      
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
        return true;
      } else {
        console.log("[useIBKRRealTimeData] Failed to reconnect");
        setIsConnected(false);
        setDataSource('mock');
        toast.error("Failed to reconnect to Interactive Brokers");
        return false;
      }
    } catch (error) {
      console.error("[useIBKRRealTimeData] Error reconnecting to IBKR:", error);
      console.error("[useIBKRRealTimeData] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      setIsConnected(false);
      setDataSource('mock');
      toast.error(`Reconnection error: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  }, [refreshAllData]);

  return {
    marketData: marketDataQuery.data as SpyMarketData | undefined,
    options: optionChainQuery.data || [],
    isLoading: marketDataQuery.isLoading || optionChainQuery.isLoading,
    isError: marketDataQuery.isError || optionChainQuery.isError,
    isConnected,
    dataSource,
    connectionDiagnostics,
    refreshAllData,
    forceConnectionCheck,
    reconnect,
    lastUpdated: marketDataQuery.dataUpdatedAt ? new Date(marketDataQuery.dataUpdatedAt) : undefined
  };
};
