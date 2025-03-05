
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyOption } from '@/lib/types/spy';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';

interface OptionChainOptions {
  symbol: string;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
}

export const useIBKROptionChain = ({
  symbol,
  enabled = true,
  staleTime = 60000, // Options data stays fresh for 1 minute
  cacheTime = 300000, // Cache for 5 minutes
  refetchInterval = 60000, // Refetch every minute
  refetchOnWindowFocus = true
}: OptionChainOptions) => {
  const optionChainQuery = useQuery({
    queryKey: ['optionChain', symbol],
    queryFn: async () => {
      try {
        console.log(`[useIBKROptionChain] Fetching option chain for ${symbol}...`);
        const provider = getDataProvider();
        
        if (!provider) {
          console.error("[useIBKROptionChain] No data provider available");
          throw new Error("No data provider available");
        }
        
        if (typeof provider.getOptionChain !== 'function') {
          console.error("[useIBKROptionChain] Provider missing getOptionChain method");
          throw new Error("Provider missing getOptionChain method");
        }
        
        console.log(`[useIBKROptionChain] Calling provider.getOptionChain('${symbol}')`);
        const startTime = Date.now();
        const options = await provider.getOptionChain(symbol);
        const endTime = Date.now();
        
        console.log(`[useIBKROptionChain] Option chain fetched in ${endTime - startTime}ms, received ${options?.length || 0} options`);
        
        return options || [];
      } catch (error) {
        console.error(`[useIBKROptionChain] Error fetching option chain for ${symbol}:`, error);
        
        // Use the IBKR-specific error handler with detailed context
        const classifiedError = handleIBKRError(error, {
          service: 'useIBKROptionChain', 
          method: 'getOptionChain',
          symbol,
          connectionMethod: (provider as any)?.config?.connectionMethod,
          paperTrading: (provider as any)?.config?.paperTrading
        });
        
        throw classifiedError;
      }
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchInterval,
    refetchOnWindowFocus
  });

  return {
    options: optionChainQuery.data as SpyOption[] | undefined,
    isLoading: optionChainQuery.isLoading,
    isError: optionChainQuery.isError,
    error: optionChainQuery.error,
    refetch: optionChainQuery.refetch,
    isFetching: optionChainQuery.isFetching,
    isRefetching: optionChainQuery.isRefetching,
    lastUpdated: optionChainQuery.dataUpdatedAt ? new Date(optionChainQuery.dataUpdatedAt) : undefined
  };
};
