
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyTrade } from '@/lib/types/spy';
import { TradeOrder } from '@/lib/types/spy/dataProvider';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

export const useTrades = (activeTab: string) => {
  const queryClient = useQueryClient();
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed in useTrades:', event, !!session);
        setIsAuthenticated(!!session);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  // Fetch trades based on active tab
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', activeTab, isAuthenticated],
    queryFn: async () => {
      try {
        console.log("Fetching trades for tab:", activeTab, "Auth state:", isAuthenticated);
        
        // If not authenticated, return mock trades for demo
        if (!isAuthenticated) {
          console.log("Not authenticated, returning mock trades");
          return getMockTrades(activeTab);
        }
        
        const provider = getDataProvider();
        console.log("Using data provider:", provider);
        
        if (!provider) {
          console.error("No data provider available");
          toast.error("Failed to get data provider");
          return getMockTrades(activeTab);
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
        return getMockTrades(activeTab);
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    enabled: true, // Always enable the query regardless of authentication state
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
          const mockTrade: SpyTrade = createMockTrade();
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

  // Helper function to create mock trades
  const getMockTrades = (tab: string): SpyTrade[] => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mockTrades: SpyTrade[] = [
      {
        id: 'mock-active-1',
        type: "CALL",
        strikePrice: 500,
        expirationDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days later
        entryPrice: 3.45,
        currentPrice: 3.75,
        targetPrice: 5.0,
        stopLoss: 2.0,
        quantity: 1,
        status: "active",
        openedAt: yesterday,
        profit: 30,
        profitPercentage: 8.7,
        confidenceScore: 0.78,
        paperTrading: true
      },
      {
        id: 'mock-closed-1',
        type: "PUT",
        strikePrice: 495,
        expirationDate: new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)), // 3 days later
        entryPrice: 2.80,
        currentPrice: 2.05,
        targetPrice: 4.0,
        stopLoss: 1.5,
        quantity: 2,
        status: "closed",
        openedAt: new Date(yesterday.getTime() - (2 * 24 * 60 * 60 * 1000)), // 3 days ago
        closedAt: yesterday,
        profit: -150,
        profitPercentage: -26.8,
        confidenceScore: 0.65,
        paperTrading: true
      }
    ];
    
    if (tab === 'active') {
      return mockTrades.filter(t => t.status === 'active' || t.status === 'pending');
    } else if (tab === 'history') {
      return mockTrades.filter(t => t.status === 'closed');
    } else if (tab === 'orders') {
      return mockTrades.filter(t => t.status === 'pending');
    }
    
    return mockTrades;
  };

  // Helper function to create a new mock trade
  const createMockTrade = (): SpyTrade => {
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    
    return {
      id: `test-${Date.now()}`,
      type: Math.random() > 0.5 ? "CALL" : "PUT",
      strikePrice: 500,
      expirationDate: expiryDate,
      entryPrice: 3.45,
      currentPrice: 3.45,
      targetPrice: 5.0,
      stopLoss: 2.0,
      quantity: 1,
      status: "active",
      openedAt: now,
      profit: 0,
      profitPercentage: 0,
      confidenceScore: 0.75,
      paperTrading: true
    };
  };

  return {
    trades,
    isLoading,
    handleCreateTestTrade,
    isPending: createPaperTrade.isPending || isCreatingTrade,
    isAuthenticated
  };
};
