
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
  const { trades, isLoading, handleCreateTestTrade, isPending, isAuthenticated, refetch, lastError } = useTrades(activeTab);
  const [connectionDiagnostics, setConnectionDiagnostics] = useState<string | null>(null);

  // Log component mounting to debug
  useEffect(() => {
    console.log("TradesPage mounted", "Authentication state:", isAuthenticated);
    return () => console.log("TradesPage unmounted");
  }, [isAuthenticated]);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const provider = getDataProvider();
        // Only use public methods and properties from the provider
        const status = {
          providerType: provider.constructor.name,
          isConnected: provider.isConnected(),
          // Don't access protected properties
        };
        console.log("Provider status:", status);
        setConnectionDiagnostics(null);
      } catch (error) {
        console.error("Error checking provider:", error);
        setConnectionDiagnostics(error instanceof Error ? error.message : String(error));
      }
    };
    
    if (isAuthenticated) {
      checkConnection();
    }
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
      />

      <ConnectionStatus 
        connectionDiagnostics={connectionDiagnostics}
        lastError={lastError}
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
