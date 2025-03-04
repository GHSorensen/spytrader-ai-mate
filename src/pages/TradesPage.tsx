
import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, LogIn } from "lucide-react";
import TradeCard from '@/components/trades/TradeCard';
import { useTrades } from '@/hooks/useTrades';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { IBKRStatusIndicator } from '@/components/ibkr/IBKRStatusIndicator';

const TradesPage: React.FC = () => {
  const accountData = useAccountBalance();
  const [activeTab, setActiveTab] = useState<string>('active');
  const { trades, isLoading, handleCreateTestTrade, isPending, isAuthenticated, refetch } = useTrades(activeTab);

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
      handleCreateTestTrade();
    } catch (error) {
      console.error("Error in onCreateTestTrade:", error);
      toast.error("Failed to create test trade");
    }
  }, [handleCreateTestTrade, isPending, isAuthenticated]);

  const onRefreshBalance = useCallback(() => {
    console.log("Refreshing account balance", "Authentication state:", accountData.isAuthenticated);
    try {
      accountData.refreshBalance?.();
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Failed to refresh account balance");
    }
  }, [accountData]);

  const onRefreshTrades = useCallback(() => {
    console.log("Manually refreshing trades");
    refetch();
    toast.info("Refreshing trades data");
  }, [refetch]);

  // If not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Trades</h1>
            <p className="text-sm text-muted-foreground">
              Manage your trading activity and orders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 md:px-3 py-1 rounded-md bg-muted text-xs md:text-sm flex items-center">
              <span>Balance: ${accountData.balance?.toLocaleString() || "0"}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 md:h-6 md:w-6 ml-1"
                onClick={onRefreshBalance}
                disabled={accountData.isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${accountData.isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-muted rounded-lg gap-3 md:gap-4">
          <h2 className="text-lg md:text-xl font-medium">Sign In Required</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You need to sign in to access your trades and create test trades.
          </p>
          <Link to="/auth">
            <Button className="mt-2 md:mt-4 text-sm md:text-base">
              <LogIn className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Trades</h1>
          <p className="text-sm text-muted-foreground">
            Manage your trading activity and orders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
          <div className="px-2 md:px-3 py-1 rounded-md bg-muted text-xs md:text-sm flex items-center">
            <span>Balance: ${accountData.balance?.toLocaleString() || "0"}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 md:h-6 md:w-6 ml-1"
              onClick={onRefreshBalance}
              disabled={accountData.isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${accountData.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <IBKRStatusIndicator showDetails={true} />
          <Button 
            onClick={onCreateTestTrade} 
            disabled={isPending}
            size="sm"
            className="flex items-center gap-1 text-xs md:text-sm"
          >
            <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
            {isPending ? "Creating..." : "Create Test Trade"}
          </Button>
          <Button
            onClick={onRefreshTrades}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-xs md:text-sm"
          >
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 text-xs md:text-sm">
          <TabsTrigger value="active">Active Trades</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          <TradeCard 
            title="Active Positions" 
            description="Currently open trades in your portfolio" 
            trades={trades} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <TradeCard 
            title="Trade History" 
            description="Your past trades and their outcomes" 
            trades={trades} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <TradeCard 
            title="Order Status" 
            description="Pending and recently filled orders" 
            trades={trades} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradesPage;
