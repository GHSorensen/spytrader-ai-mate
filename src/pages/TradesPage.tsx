
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyTrade } from '@/lib/types/spy';
import { TradeOrder } from '@/lib/types/spy/dataProvider';

const TradesPage: React.FC = () => {
  const accountData = useAccountBalance();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('active');

  // Fetch trades based on active tab
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', activeTab],
    queryFn: async () => {
      const provider = getDataProvider();
      const allTrades = await provider.getTrades();
      
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
    },
  });

  // Create a paper trade for testing
  const createPaperTrade = useMutation({
    mutationFn: async () => {
      try {
        // Create a mock SPY option trade
        const provider = getDataProvider();
        
        // Create a sample trade order
        const order: TradeOrder = {
          symbol: 'SPY',
          quantity: 1,
          action: 'BUY',
          orderType: 'MARKET',
          duration: 'DAY'
        };
        
        // Check if provider has placeTrade method
        if (provider.placeTrade) {
          return await provider.placeTrade(order);
        } else {
          // Fallback to create a mock trade directly
          const mockTrade: SpyTrade = {
            id: `test-${Date.now()}`,
            type: Math.random() > 0.5 ? "CALL" : "PUT",
            strikePrice: 500,
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            entryPrice: 3.45,
            currentPrice: 3.45,
            targetPrice: 5.0,
            stopLoss: 2.0,
            quantity: 1,
            status: "active",
            openedAt: new Date(),
            profit: 0,
            profitPercentage: 0,
            confidenceScore: 0.75,
            paperTrading: true
          };
          
          // In a real app, you'd save this to your backend
          // For now, we'll just return it and manually add it to the cache
          return { trade: mockTrade };
        }
      } catch (error) {
        console.error("Error creating paper trade:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Paper trade created for testing");
      // Refresh the trades data
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['todaysTrades'] });
    },
    onError: (error) => {
      toast.error(`Failed to create paper trade: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  const handleCreateTestTrade = () => {
    createPaperTrade.mutate();
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const renderTradeTable = (trades: SpyTrade[]) => {
    if (trades.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No trades to display.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Strike</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="text-right">P/L</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const isProfit = (trade.profit && trade.profit > 0) || false;
            
            return (
              <TableRow key={trade.id}>
                <TableCell>
                  <Badge variant={trade.type === 'CALL' ? 'outline' : 'secondary'}>
                    {trade.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">${trade.strikePrice}</TableCell>
                <TableCell>{formatDate(trade.expirationDate)}</TableCell>
                <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                <TableCell>${trade.currentPrice.toFixed(2)}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell className="text-right">
                  {trade.profit !== undefined ? (
                    <div className="flex items-center justify-end gap-1">
                      {isProfit ? 
                        <ArrowUpRight className="h-4 w-4 text-green-500" /> : 
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      }
                      <span className={cn(
                        "font-medium",
                        isProfit ? "text-green-500" : "text-red-500"
                      )}>
                        {isProfit ? "+" : ""}{trade.profit.toFixed(2)}$
                        {trade.profitPercentage !== undefined && ` (${isProfit ? "+" : ""}${trade.profitPercentage.toFixed(2)}%)`}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant={
                      trade.status === 'active' ? 'default' :
                      trade.status === 'pending' ? 'outline' :
                      trade.status === 'closed' && isProfit ? 'default' : 'destructive'
                    }
                    className={
                      trade.status === 'active' ? 'bg-blue-500/20 text-blue-700' :
                      trade.status === 'pending' ? '' :
                      trade.status === 'closed' && isProfit ? 'bg-green-500/20 text-green-700' : 
                      'bg-red-500/20 text-red-700'
                    }
                  >
                    {trade.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

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
            disabled={createPaperTrade.isPending}
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
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>
                Currently open trades in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                renderTradeTable(trades)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                Your past trades and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                renderTradeTable(trades)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Pending and recently filled orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                renderTradeTable(trades)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradesPage;
