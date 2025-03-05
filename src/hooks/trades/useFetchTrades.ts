
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyTrade } from '@/lib/types/spy';
import { toast } from "sonner";
import { getMockTrades } from './mockTradesUtils';
import { useIBKRRetryPolicy } from '@/hooks/ibkr/useIBKRRetryPolicy';

export const useFetchTrades = (activeTab: string, isAuthenticated: boolean) => {
  // Initialize the retry policy hook with custom configuration
  const { executeWithRetry, retryCount, isRetrying, lastError, resetRetryState } = useIBKRRetryPolicy({
    maxRetries: 3,
    initialDelay: 2000,
    backoffFactor: 1.5,
    maxDelay: 15000,
    retryOnCodes: [429, 503, 504, 408] // Rate limiting and temporary server errors
  });

  const { data: trades = [], isLoading, refetch } = useQuery({
    queryKey: ['trades', activeTab, isAuthenticated, retryCount],
    queryFn: async () => {
      try {
        console.log("Fetching trades for tab:", activeTab, "Auth state:", isAuthenticated);
        
        // If not authenticated, return mock trades for demo
        if (!isAuthenticated) {
          console.log("Not authenticated, returning mock trades");
          return getMockTrades(activeTab);
        }
        
        // Use executeWithRetry to fetch data with resilience
        return await executeWithRetry(
          async () => {
            const provider = getDataProvider();
            console.log("Using data provider:", provider);
            
            if (!provider) {
              console.error("No data provider available");
              toast.error("Failed to get data provider");
              return getMockTrades(activeTab);
            }
            
            // Check if provider is connected
            if (!provider.isConnected()) {
              try {
                console.log("Provider not connected, attempting to connect...");
                const connected = await provider.connect();
                if (!connected) {
                  console.log("Failed to connect to provider, using mock trades");
                  return getMockTrades(activeTab);
                }
              } catch (connError) {
                console.error("Error connecting to provider:", connError);
                return getMockTrades(activeTab);
              }
            }
            
            const allTrades = await provider.getTrades();
            console.log("Fetched trades:", allTrades);
            
            switch (activeTab) {
              case 'active':
                return allTrades.filter(trade => trade.status === 'active' || trade.status === 'pending');
              case 'history':
                return allTrades.filter(trade => trade.status === 'closed');
              case 'orders':
                return allTrades.filter(trade => trade.status === 'pending');
              default:
                return allTrades;
            }
          },
          // Include context for better error logging
          {
            component: 'useFetchTrades',
            method: 'queryFn',
            activeTab,
            authenticated: isAuthenticated
          }
        );
      } catch (error) {
        console.error("Error fetching trades:", error);
        toast.error("Failed to fetch trades data");
        
        // Reset retry state after handling the error
        resetRetryState();
        
        return getMockTrades(activeTab);
      }
    },
    refetchInterval: 30000, 
    refetchOnWindowFocus: true,
    enabled: true, 
  });

  return { 
    trades, 
    isLoading, 
    refetch,
    isRetrying,
    lastError,
    retryCount
  };
};
