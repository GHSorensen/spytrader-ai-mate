
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useTrades } from '@/hooks/useTrades';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import TradePageHeader from '@/components/trades/TradePageHeader';
import ConnectionStatus from '@/components/trades/ConnectionStatus';
import SignInPrompt from '@/components/trades/SignInPrompt';
import TradeTabs from '@/components/trades/TradeTabs';
import { RefreshCw } from "lucide-react";

const TradesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const { 
    trades, 
    isLoading, 
    handleCreateTestTrade, 
    isPending, 
    isAuthenticated, 
    refetch, 
    lastError, 
    isRetrying, 
    retryCount,
    connectionDiagnostics,
    reconnectAttempts
  } = useTrades(activeTab);

  // Log component mounting to debug
  useEffect(() => {
    console.log("TradesPage mounted", "Authentication state:", isAuthenticated);
    return () => console.log("TradesPage unmounted");
  }, [isAuthenticated]);

  const onCreateTestTrade = useCallback(() => {
    console.log("Create Test Trade button clicked", "Authentication state:", isAuthenticated);
    if (isPending) {
      toast.info("Trade creation already in progress");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("You need to sign in to create trades");
      return;
    }
    
    try {
      toast.info("Attempting to create test trade...");
      handleCreateTestTrade();
    } catch (error) {
      console.error("Error in onCreateTestTrade:", error);
      toast.error("Failed to create test trade: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [handleCreateTestTrade, isPending, isAuthenticated]);

  const onRefreshTrades = useCallback(() => {
    console.log("Manually refreshing trades");
    refetch();
    toast.info("Refreshing trades data");
  }, [refetch]);

  // Handler for manual reconnection
  const handleManualReconnect = useCallback(async () => {
    try {
      console.log("Manual reconnect initiated");
      toast.info("Attempting to reconnect...");
      
      const provider = getDataProvider();
      if (provider) {
        const connected = await provider.connect();
        if (connected) {
          toast.success("Successfully reconnected");
          refetch();
        } else {
          toast.error("Failed to reconnect");
        }
      } else {
        toast.error("Data provider not available");
      }
    } catch (error) {
      console.error("Reconnect error:", error);
      toast.error("Reconnection failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [refetch]);

  // If not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return <SignInPrompt onRefreshBalance={onRefreshTrades} />;
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <TradePageHeader 
        isAuthenticated={isAuthenticated}
        isPending={isPending}
        onCreateTestTrade={onCreateTestTrade}
        onRefreshTrades={onRefreshTrades}
        isLoading={isLoading}
        isRetrying={isRetrying}
        retryCount={retryCount}
        reconnectAttempts={reconnectAttempts}
      />

      <ConnectionStatus 
        connectionDiagnostics={connectionDiagnostics}
        lastError={lastError}
        isRetrying={isRetrying}
        retryCount={retryCount}
        reconnectAttempts={reconnectAttempts}
        onManualReconnect={handleManualReconnect}
      />

      <TradeTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trades={trades}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TradesPage;
