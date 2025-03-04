
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradeCard from '@/components/trades/TradeCard';
import { SpyTrade } from '@/lib/types/spy';

interface TradeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  trades: SpyTrade[];
  isLoading: boolean;
}

const TradeTabs: React.FC<TradeTabsProps> = ({
  activeTab,
  setActiveTab,
  trades,
  isLoading
}) => {
  return (
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
  );
};

export default TradeTabs;
