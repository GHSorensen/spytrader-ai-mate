
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { TradeOrder } from '@/lib/types/spy/dataProvider';
import { toast } from "sonner";
import { createMockTrade } from './mockTradesUtils';

export const useCreateTrade = (isAuthenticated: boolean, refetch: () => void) => {
  const queryClient = useQueryClient();
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

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
          const mockTrade = createMockTrade();
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

  return {
    handleCreateTestTrade,
    isPending: createPaperTrade.isPending || isCreatingTrade,
    lastError
  };
};
