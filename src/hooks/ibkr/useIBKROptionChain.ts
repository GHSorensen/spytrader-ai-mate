
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyOption } from '@/lib/types/spy';
import { logError } from '@/lib/errorMonitoring/core/logger';

// Default polling interval for option chain
const DEFAULT_POLLING_INTERVAL = 6000;

interface OptionChainOptions {
  symbol: string;
  enabled?: boolean;
  pollingInterval?: number;
  retryCount?: number;
}

export const useIBKROptionChain = ({
  symbol,
  enabled = true,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  retryCount = 2
}: OptionChainOptions) => {
  const optionChainQuery = useQuery({
    queryKey: ['optionChain', symbol],
    queryFn: async () => {
      try {
        console.log(`[useIBKROptionChain] Fetching option chain for ${symbol}...`);
        const provider = getDataProvider();
        console.log("[useIBKROptionChain] Using provider:", provider?.constructor.name);
        
        if (!provider) {
          console.error("[useIBKROptionChain] No data provider available for option chain");
          throw new Error("No data provider available");
        }
        
        if (typeof provider.getOptionChain !== 'function') {
          console.error("[useIBKROptionChain] Provider missing getOptionChain method");
          throw new Error("Provider missing getOptionChain method");
        }
        
        console.log(`[useIBKROptionChain] Calling provider.getOptionChain('${symbol}')`);
        const startTime = Date.now();
        const data = await provider.getOptionChain(symbol);
        const endTime = Date.now();
        
        console.log(`[useIBKROptionChain] Option chain fetched in ${endTime - startTime}ms`);
        console.log("[useIBKROptionChain] Received options count:", data?.length || 0);
        
        // Log a sample of the options if available
        if (data && data.length > 0) {
          console.log("[useIBKROptionChain] First 3 options sample:", 
            data.slice(0, 3).map(opt => ({
              strike: opt.strikePrice,
              type: opt.type,
              expiry: opt.expirationDate,
              bid: opt.bidPrice,
              ask: opt.askPrice
            }))
          );
        }
        
        return data || [];
      } catch (error) {
        console.error(`[useIBKROptionChain] Error fetching option chain for ${symbol}:`, error);
        console.error("[useIBKROptionChain] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
        
        // Log the error to monitoring system
        if (error instanceof Error) {
          logError(error, { 
            service: 'useIBKROptionChain', 
            method: 'getOptionChain',
            symbol 
          });
        }
        
        // Return empty array instead of throwing to handle errors gracefully
        return [];
      }
    },
    refetchInterval: pollingInterval,
    retry: retryCount,
    enabled: enabled && !!symbol
  });

  return {
    options: optionChainQuery.data || [],
    isLoading: optionChainQuery.isLoading,
    isError: optionChainQuery.isError,
    error: optionChainQuery.error,
    lastUpdated: optionChainQuery.dataUpdatedAt ? new Date(optionChainQuery.dataUpdatedAt) : undefined,
    refetch: optionChainQuery.refetch
  };
};
