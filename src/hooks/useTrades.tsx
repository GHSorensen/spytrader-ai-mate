
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyTrade } from '@/lib/types/spy';
import { TradeOrder } from '@/lib/types/spy/dataProvider';
import { toast } from "sonner";

export const useTrades = (activeTab: string) => {
  const queryClient = useQueryClient();
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);

  // Fetch trades based on active tab
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', activeTab],
    queryFn: async () => {
      try {
        const provider = getDataProvider();
        console.log("Fetching trades for tab:", activeTab);
        
        if (!provider) {
          console.error("No data provider available");
          toast.error("Failed to get data provider");
          return [];
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
      } catch (error) {
        console.error("Error fetching trades:", error);
        toast.error("Failed to fetch trades data");
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Create a paper trade for testing
  const createPaperTrade = useMutation({
    mutationFn: async () => {
      console.log("Creating paper trade...");
      setIsCreatingTrade(true);
      
      try {
        // Create a mock SPY option trade
        const provider = getDataProvider();
        
        if (!provider) {
          throw new Error("No data provider available");
        }
        
        console.log("Got data provider:", provider);
        
        // Create a sample trade order
        const order: TradeOrder = {
          symbol: 'SPY',
          quantity: 1,
          action: 'BUY',
          orderType: 'MARKET',
          duration: 'DAY'
        };
        
        console.log("Placing trade with order:", order);
        
        // Check if provider has placeTrade method
        if (provider && typeof provider.placeTrade === 'function') {
          console.log("Provider has placeTrade method, calling it");
          const result = await provider.placeTrade(order);
          console.log("Trade placed, result:", result);
          return result;
        } else {
          console.log("Provider doesn't have placeTrade method, creating mock trade");
          // Fallback to create a mock trade directly
          const mockTrade: SpyTrade = {
            id: `test-${Date.now()}`,
            type: Math.random() > 0.5 ? "CALL" : "PUT",
            strikePrice: 500,
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            entryPrice: 3.45,
            currentPrice: 3.45,
            targetPrice: 5.0,
            stopLoss: 2.0,
            quantity: 1,
            status: "active",
            openedAt: new Date(),
            profit: 0,
            profitPercentage: 0,
            confidenceScore: 0.75,
            paperTrading: true
          };
          
          console.log("Created mock trade:", mockTrade);
          return { trade: mockTrade };
        }
      } catch (error) {
        console.error("Error in createPaperTrade:", error);
        throw error;
      } finally {
        setIsCreatingTrade(false);
      }
    },
    onSuccess: (data) => {
      console.log("Paper trade created successfully:", data);
      toast.success("Paper trade created for testing");
      // Refresh the trades data
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
    onError: (error) => {
      console.error("Error in createPaperTrade mutation:", error);
      toast.error(`Failed to create paper trade: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  const handleCreateTestTrade = () => {
    console.log("handleCreateTestTrade called");
    
    if (isCreatingTrade || createPaperTrade.isPending) {
      console.log("Already creating a trade, ignoring request");
      toast.info("Trade creation already in progress");
      return;
    }
    
    console.log("Starting paper trade creation");
    createPaperTrade.mutate();
  };

  return {
    trades,
    isLoading,
    handleCreateTestTrade,
    isPending: createPaperTrade.isPending || isCreatingTrade
  };
};
