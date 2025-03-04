
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
      const provider = getDataProvider();
      const allTrades = await provider.getTrades();
      
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
  });

  // Create a paper trade for testing
  const createPaperTrade = useMutation({
    mutationFn: async () => {
      console.log("Create paper trade mutation starting...");
      
      // Create a mock SPY option trade
      const provider = getDataProvider();
      
      // Create a sample trade order
      const order: TradeOrder = {
        symbol: 'SPY',
        quantity: 1,
        action: 'BUY',
        orderType: 'MARKET',
        duration: 'DAY'
      };
      
      console.log("Got data provider, placing trade with order:", order);
      
      // Check if provider has placeTrade method
      if (typeof provider.placeTrade === 'function') {
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
    setIsCreatingTrade(true);
    
    try {
      createPaperTrade.mutate(undefined, {
        onSettled: () => {
          setIsCreatingTrade(false);
        }
      });
    } catch (error) {
      console.error("Error triggering paper trade creation:", error);
      setIsCreatingTrade(false);
      toast.error("Failed to start paper trade creation");
    }
  };

  return {
    trades,
    isLoading,
    handleCreateTestTrade,
    isPending: createPaperTrade.isPending || isCreatingTrade
  };
};
