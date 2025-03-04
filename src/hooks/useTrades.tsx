
import { useTradesAuth } from './trades/useTradesAuth';
import { useFetchTrades } from './trades/useFetchTrades';
import { useCreateTrade } from './trades/useCreateTrade';

export const useTrades = (activeTab: string) => {
  // Get authentication state
  const { isAuthenticated } = useTradesAuth();
  
  // Fetch trades based on active tab
  const { trades, isLoading, refetch } = useFetchTrades(activeTab, isAuthenticated);
  
  // Handle trade creation
  const { handleCreateTestTrade, isPending, lastError } = useCreateTrade(isAuthenticated, refetch);

  return {
    trades,
    isLoading,
    handleCreateTestTrade,
    isPending,
    isAuthenticated,
    lastError,
    refetch
  };
};
