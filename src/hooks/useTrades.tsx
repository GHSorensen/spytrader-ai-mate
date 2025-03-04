import { useState, useEffect, useCallback } from 'react';
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
  const [lastError, setLastError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const isAuthed = !!data.session;
      console.log("useTrades - Auth check:", isAuthed);
      setIsAuthenticated(isAuthed);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const newAuthState = !!session;
        console.log('Auth state changed in useTrades:', event, newAuthState);
        setIsAuthenticated(newAuthState);
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  // Fetch trades based on active tab
  const { data: trades = [], isLoading, refetch } = useQuery({
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
      } catch (error) {
        console.error("Error fetching trades:", error);
        toast.error("Failed to fetch trades data");
        return getMockTrades(activeTab);
      }
    },
    refetchInterval: 30000, 
    refetchOnWindowFocus: true,
    enabled: true, 
  });

  // Create a paper trade for testing with enhanced error handling
  const createPaperTrade = useMutation({
    mutationFn: async () => {
      setLastError(null);
      console.log("Creating paper trade...");
      setIsCreatingTrade(true);
      
      try {
        if (!isAuthenticated) {
          const errorMsg = "Authentication required to create test trade";
          setLastError(errorMsg);
          toast.error("Authentication Required", {
            description: "Please sign in to create a test trade."
          });
          throw new Error(errorMsg);
        }
        
        // Create a mock SPY option trade
        const provider = getDataProvider();
        
        if (!provider) {
          const errorMsg = "No data provider available";
          setLastError(errorMsg);
          toast.error("Provider Missing", {
            description: "No data provider available. Please configure a broker integration."
          });
          throw new Error(errorMsg);
        }
        
        console.log("Got data provider:", provider.constructor.name);
        
        // Force connection attempt before proceeding
        let isConnected = provider.isConnected();
        console.log("Initial connection status:", isConnected);
        
        if (!isConnected) {
          console.log("Provider not connected, attempting to connect...");
          try {
            const connected = await provider.connect();
            console.log("Connection attempt result:", connected);
            isConnected = connected;
            
            if (!connected) {
              console.log("Connection failed, but will try paper trade");
              toast.warning("Connection Status", {
                description: "Could not connect to your broker. Using a paper trade instead."
              });
            }
          } catch (connErr) {
            console.error("Connection error:", connErr);
            setLastError(`Connection error: ${connErr instanceof Error ? connErr.message : "Unknown connection error"}`);
            // Continue with paper trade
          }
        }
        
        // Create a sample trade order - make it a MARKET order to avoid issues
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
          
          try {
            const result = await provider.placeTrade(order);
            console.log("Trade placed, result:", result);
            
            // If the result indicates a paper trade was created instead
            if (result.isPaperTrade) {
              toast.success("Paper Trade Created", {
                description: result.message || "Created paper trade for testing purposes."
              });
            } else {
              toast.success("Test Trade Created", {
                description: "Your test trade has been successfully created."
              });
            }
            
            return result;
          } catch (tradeError) {
            console.error("Trade placement error:", tradeError);
            setLastError(`Trade error: ${tradeError instanceof Error ? tradeError.message : "Unknown trade error"}`);
            
            // Create fallback paper trade
            const fallbackTrade = createMockTrade();
            toast.warning("Trade Error", {
              description: "Error placing trade. Created paper trade instead."
            });
            return { trade: fallbackTrade, isPaperTrade: true };
          }
        } else {
          console.log("Provider doesn't have placeTrade method, creating mock trade");
          // Fallback to create a mock trade directly
          const mockTrade: SpyTrade = createMockTrade();
          console.log("Created mock trade:", mockTrade);
          
          toast.success("Paper Trade Created", {
            description: "Created a paper trade for testing purposes."
          });
          
          return { trade: mockTrade, isPaperTrade: true };
        }
      } catch (error) {
        console.error("Error in createPaperTrade:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error creating trade";
        if (!lastError) {
          setLastError(errorMessage);
        }
        throw error;
      } finally {
        setIsCreatingTrade(false);
      }
    },
    onSuccess: (data) => {
      console.log("Paper trade created successfully:", data);
      // Refresh the trades data
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      refetch();
    },
    onError: (error) => {
      console.error("Error in createPaperTrade mutation:", error);
      if (error instanceof Error && error.message !== "Authentication required") {
        toast.error(`Failed to create test trade: ${error.message}`);
      }
    }
  });

  const handleCreateTestTrade = useCallback(() => {
    console.log("handleCreateTestTrade called, auth state:", isAuthenticated);
    
    if (isCreatingTrade || createPaperTrade.isPending) {
      console.log("Already creating a trade, ignoring request");
      toast.info("Trade creation already in progress");
      return;
    }
    
    if (!isAuthenticated) {
      console.log("Not authenticated, showing error");
      toast.error("Authentication Required", {
        description: "Please sign in to create a test trade."
      });
      return;
    }
    
    console.log("Starting paper trade creation");
    // Reset last error before starting new attempt
    setLastError(null);
    createPaperTrade.mutate();
  }, [isAuthenticated, isCreatingTrade, createPaperTrade]);

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
    isAuthenticated,
    lastError,
    refetch
  };
};
