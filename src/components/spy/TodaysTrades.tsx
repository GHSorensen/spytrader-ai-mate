
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { SpyTrade } from '@/lib/types/spy';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

export const TodaysTrades: React.FC = () => {
  // Fetch today's trades
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['todaysTrades'],
    queryFn: async () => {
      const provider = getDataProvider();
      const allTrades = await provider.getTrades();
      
      // Filter to only show today's trades
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return allTrades
        .filter(trade => new Date(trade.openedAt) >= today)
        .slice(0, 5); // Limit to 5 most recent trades
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatTime = (date: Date) => {
    return format(new Date(date), 'hh:mm a');
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold tracking-tight">Today's Trades</CardTitle>
        <Link to="/trades">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : trades.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
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
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 opacity-70" />
                          {formatTime(trade.openedAt)}
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
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center flex-col gap-2">
            <p className="text-muted-foreground">No trades today</p>
            <p className="text-xs text-muted-foreground">AI will execute trades based on market conditions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysTrades;
