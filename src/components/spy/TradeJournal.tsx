
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Calendar, BarChart2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyTrade } from '@/lib/types/spy';

export const TradeJournal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed'>('all');
  
  // Fetch trades from connected broker
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['tradeJournal', activeTab],
    queryFn: async () => {
      const provider = getDataProvider();
      const allTrades = await provider.getTrades();
      
      switch (activeTab) {
        case 'open':
          return allTrades.filter(trade => trade.status === 'active' || trade.status === 'pending');
        case 'closed':
          return allTrades.filter(trade => trade.status === 'closed');
        default:
          return allTrades;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'hh:mm a');
  };
  
  // Calculate summary metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => (t.profit || 0) > 0).length;
  const losingTrades = trades.filter(t => (t.profit || 0) < 0).length;
  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight flex justify-between items-center">
          <span>Paper Trading Journal</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <Badge variant={totalProfit >= 0 ? "default" : "destructive"}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}$ ({winRate.toFixed(1)}% Win)
            </Badge>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
        <Tabs value={activeTab} onValueChange={(value: 'all' | 'open' | 'closed') => setActiveTab(value)}>
          <TabsList className="grid w-[300px] grid-cols-3">
            <TabsTrigger value="all">All Trades</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : trades.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Time</TableHead>
                  <TableHead className="hidden lg:table-cell">Confidence</TableHead>
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
                      <TableCell className="hidden md:table-cell">{formatDate(trade.expirationDate)}</TableCell>
                      <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                      <TableCell>${trade.closedAt ? trade.currentPrice.toFixed(2) : '-'}</TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 opacity-70" />
                          {formatDate(trade.openedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 opacity-70" />
                          {formatTime(trade.openedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center">
                          <BarChart2 className="h-3 w-3 mr-1 opacity-70" />
                          {(trade.confidenceScore * 100).toFixed(0)}%
                        </div>
                      </TableCell>
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
          </div>
        ) : (
          <div className="h-52 flex items-center justify-center flex-col gap-2">
            <p className="text-muted-foreground">No trades found</p>
            <p className="text-sm text-muted-foreground">AI will automatically execute trades based on market conditions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
