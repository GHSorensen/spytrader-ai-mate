
import { useTradesAuth } from './trades/useTradesAuth';
import { useFetchTrades } from './trades/useFetchTrades';
import { useCreateTrade } from './trades/useCreateTrade';
import { useState, useEffect } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { toast } from 'sonner';
import { classifyError } from '@/lib/errorMonitoring/utils/errorClassifier';
import { ErrorCategory } from '@/lib/errorMonitoring/types/errorClassification';

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
            
            // Show reconnection toast
            toast.loading(`Reconnecting (attempt ${reconnectAttempts + 1})...`);
            
            // Try to reconnect
            const connected = await provider.connect();
            if (connected) {
              console.log("Provider reconnected successfully");
              setConnectionDiagnostics("Connection restored");
              
              // Show success toast
              toast.success("Connection Restored", {
                description: "Successfully reconnected to the data provider."
              });
              
              // Refresh data after successful reconnection
              setTimeout(() => {
                refetch();
                setConnectionDiagnostics(null);
              }, 1000);
            } else {
              console.error("Failed to reconnect to provider");
              setConnectionDiagnostics("Reconnect failed, will retry automatically");
              
              // Show error toast
              toast.error("Reconnection Failed", {
                description: "Could not reconnect to data provider. Will retry automatically."
              });
            }
          } else {
            // Classify the error for better context
            const classifiedError = classifyError(lastError);
            
            // Handle according to error category
            if (classifiedError.category === ErrorCategory.TIMEOUT) {
              setConnectionDiagnostics("Request timed out, retrying...");
              toast.warning("Request Timeout", {
                description: "The request timed out. Retrying..."
              });
            } else if (classifiedError.category === ErrorCategory.RATE_LIMIT) {
              setConnectionDiagnostics("Rate limit exceeded, please wait before retrying");
              toast.warning("Rate Limit Exceeded", {
                description: "Too many requests. Please wait before trying again."
              });
            } else {
              setConnectionDiagnostics("Connection issues detected, but provider reports connected");
            }
          }
        } catch (error) {
          console.error("Error during reconnect:", error);
          setConnectionDiagnostics(
            error instanceof Error 
              ? `Connection error: ${error.message}` 
              : "Unknown connection error"
          );
          
          // Show error toast
          toast.error("Reconnection Error", {
            description: error instanceof Error ? error.message : "Unknown error during reconnection"
          });
        }
      };
      
      checkConnection();
    }
  }, [lastError, isAuthenticated, isRetrying, refetch, reconnectAttempts]);
  
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
