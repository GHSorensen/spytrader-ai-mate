
import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import TradeCard from '@/components/trades/TradeCard';
import { useTrades } from '@/hooks/useTrades';
import { toast } from 'sonner';

const TradesPage: React.FC = () => {
  const accountData = useAccountBalance();
  const [activeTab, setActiveTab] = useState<string>('active');
  const { trades, isLoading, handleCreateTestTrade, isPending } = useTrades(activeTab);

  // Log component mounting to debug
  useEffect(() => {
    console.log("TradesPage mounted");
    return () => console.log("TradesPage unmounted");
  }, []);

  const onCreateTestTrade = useCallback(() => {
    console.log("Create Test Trade button clicked");
    if (isPending) {
      toast.info("Trade creation already in progress");
      return;
    }
    try {
      handleCreateTestTrade();
    } catch (error) {
      console.error("Error in onCreateTestTrade:", error);
      toast.error("Failed to create test trade");
    }
  }, [handleCreateTestTrade, isPending]);

  const onRefreshBalance = useCallback(() => {
    console.log("Refreshing account balance");
    try {
      accountData.refreshBalance?.();
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Failed to refresh account balance");
    }
  }, [accountData]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground">
            Manage your trading activity and orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-md bg-muted text-sm flex items-center">
            <span>Balance: ${accountData.balance?.toLocaleString() || "0"}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1"
              onClick={onRefreshBalance}
              disabled={accountData.isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${accountData.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Button 
            onClick={onCreateTestTrade} 
            disabled={isPending}
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            {isPending ? "Creating..." : "Create Test Trade"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
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
