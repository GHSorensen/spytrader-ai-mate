
import { useTradesAuth } from './trades/useTradesAuth';
import { useFetchTrades } from './trades/useFetchTrades';
import { useCreateTrade } from './trades/useCreateTrade';
import { useState, useEffect } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

export const useTrades = (activeTab: string) => {
  // Get authentication state
  const { isAuthenticated } = useTradesAuth();
  
  // Track connection diagnostics
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Fetch trades based on active tab
  const { 
    trades, 
    isLoading, 
    refetch, 
    isRetrying, 
    lastError, 
    retryCount 
  } = useFetchTrades(activeTab, isAuthenticated);
  
  // Handle trade creation
  const { handleCreateTestTrade, isPending } = useCreateTrade(isAuthenticated, refetch);
  
  // Auto-reconnect when errors occur
  useEffect(() => {
    if (lastError && isAuthenticated && !isRetrying) {
      const checkConnection = async () => {
        try {
          const provider = getDataProvider();
          if (provider && !provider.isConnected()) {
            console.log("Provider disconnected, attempting to reconnect...");
            setReconnectAttempts(prev => prev + 1);
            
            // Try to reconnect
            const connected = await provider.connect();
            if (connected) {
              console.log("Provider reconnected successfully");
              setConnectionDiagnostics("Connection restored");
              
              // Refresh data after successful reconnection
              setTimeout(() => {
                refetch();
                setConnectionDiagnostics(null);
              }, 1000);
            } else {
              console.error("Failed to reconnect to provider");
              setConnectionDiagnostics("Reconnect failed, will retry automatically");
            }
          } else {
            setConnectionDiagnostics("Connection issues detected, but provider reports connected");
          }
        } catch (error) {
          console.error("Error during reconnect:", error);
          setConnectionDiagnostics(
            error instanceof Error 
              ? `Connection error: ${error.message}` 
              : "Unknown connection error"
          );
        }
      };
      
      checkConnection();
    }
  }, [lastError, isAuthenticated, isRetrying, refetch]);
  
  // Reset reconnect attempts when connection is successful
  useEffect(() => {
    if (!isRetrying && !lastError && reconnectAttempts > 0) {
      setReconnectAttempts(0);
    }
  }, [isRetrying, lastError, reconnectAttempts]);

  return {
    trades,
    isLoading,
    handleCreateTestTrade,
    isPending,
    isAuthenticated,
    lastError,
    refetch,
    isRetrying,
    retryCount,
    connectionDiagnostics,
    reconnectAttempts
  };
};
