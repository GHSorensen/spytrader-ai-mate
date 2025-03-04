
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import TradeCard from '@/components/trades/TradeCard';
import { useTrades } from '@/hooks/useTrades';

const TradesPage: React.FC = () => {
  const accountData = useAccountBalance();
  const [activeTab, setActiveTab] = useState<string>('active');
  const { trades, isLoading, handleCreateTestTrade, isPending } = useTrades(activeTab);

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
          <div className="px-3 py-1 rounded-md bg-muted text-sm">
            Balance: ${accountData.balance.toLocaleString()}
          </div>
          <Button 
            onClick={handleCreateTestTrade} 
            disabled={isPending}
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Create Test Trade
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
