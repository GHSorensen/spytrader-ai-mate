
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyMarketData } from '@/lib/types/spy';
import { logError } from '@/lib/errorMonitoring/core/logger';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';

// Default polling interval for market data
const DEFAULT_POLLING_INTERVAL = 3000;
// Default stale time (15 seconds)
const DEFAULT_STALE_TIME = 15000;
// Default cache time (5 minutes)
const DEFAULT_CACHE_TIME = 300000;

interface MarketDataOptions {
  enabled?: boolean;
  pollingInterval?: number;
  retryCount?: number;
  staleTime?: number;
  cacheTime?: number;
}

export const useIBKRMarketData = ({
  enabled = true,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  retryCount = 3,
  staleTime = DEFAULT_STALE_TIME,
  cacheTime = DEFAULT_CACHE_TIME
}: MarketDataOptions = {}) => {
  const marketDataQuery = useQuery({
    queryKey: ['marketData'],
    queryFn: async () => {
      try {
        console.log("[useIBKRMarketData] Fetching market data...");
        const provider = getDataProvider();
        console.log("[useIBKRMarketData] Using provider:", provider?.constructor.name);
        
        if (!provider) {
          console.error("[useIBKRMarketData] No data provider available for market data");
          throw new Error("No data provider available");
        }
        
        if (typeof provider.getMarketData !== 'function') {
          console.error("[useIBKRMarketData] Provider missing getMarketData method");
          throw new Error("Provider missing getMarketData method");
        }
        
        console.log("[useIBKRMarketData] Calling provider.getMarketData()");
        const startTime = Date.now();
        const data = await provider.getMarketData();
        const endTime = Date.now();
        
        console.log(`[useIBKRMarketData] Market data fetched in ${endTime - startTime}ms`);
        
        // Debug the returned data
        if (data) {
          console.log("[useIBKRMarketData] Received market data:", {
            price: data.price,
            change: data.change,
            volume: data.volume,
            timestamp: data.timestamp
          });
        } else {
          console.warn("[useIBKRMarketData] Received null/undefined market data");
          return null;
        }
        
        return data;
      } catch (error) {
        console.error("[useIBKRMarketData] Error fetching market data:", error);
        
        // Use the IBKR-specific error handler with detailed context
        const classifiedError = handleIBKRError(error, {
          service: 'useIBKRMarketData',
          method: 'getMarketData',
          connectionMethod: (provider as any)?.config?.connectionMethod,
          paperTrading: (provider as any)?.config?.paperTrading
        });
        
        throw classifiedError;
      }
    },
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true,
    retry: retryCount,
    enabled,
    staleTime,
    gcTime: cacheTime
  });

  return {
    marketData: marketDataQuery.data as SpyMarketData | undefined,
    isLoading: marketDataQuery.isLoading,
    isError: marketDataQuery.isError,
    error: marketDataQuery.error,
    lastUpdated: marketDataQuery.dataUpdatedAt ? new Date(marketDataQuery.dataUpdatedAt) : undefined,
    refetch: marketDataQuery.refetch,
    isFetching: marketDataQuery.isFetching,
    isStale: marketDataQuery.isStale,
    isRefetching: marketDataQuery.isRefetching,
    status: marketDataQuery.status,
    fetchStatus: marketDataQuery.fetchStatus
  };
};
