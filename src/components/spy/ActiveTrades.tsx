import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { getSpyTradesByStatus } from '@/services/spyOptionsService';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RiskToleranceType } from '@/lib/types/spy';

interface ActiveTradesProps {
  riskTolerance?: RiskToleranceType;
}

export const ActiveTrades = ({ riskTolerance = 'moderate' }: ActiveTradesProps) => {
  const { data: trades, isLoading } = useQuery({
    queryKey: ['spyTrades', 'active', riskTolerance],
    queryFn: () => getSpyTradesByStatus('active'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Active SPY Trades
          {riskTolerance && (
            <Badge variant="outline" className="ml-2 capitalize">
              {riskTolerance}
            </Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm">View All Trades</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : trades && trades.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden md:table-cell">Stop</TableHead>
                  <TableHead className="hidden md:table-cell">Target</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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
                      <TableCell>${trade.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell className="hidden md:table-cell">${trade.stopLoss.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">${trade.targetPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isProfit ? 
                            <ArrowUpRight className="h-4 w-4 text-positive" /> : 
                            <ArrowDownRight className="h-4 w-4 text-negative" />
                          }
                          <span className={cn(
                            "font-medium",
                            isProfit ? "text-positive" : "text-negative"
                          )}>
                            {isProfit ? "+" : ""}{trade.profit}$ ({trade.profitPercentage?.toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-52 flex items-center justify-center flex-col gap-2">
            <p className="text-muted-foreground">No active trades found</p>
            <p className="text-sm text-muted-foreground">AI agent will automatically initiate trades based on market conditions and {riskTolerance} risk profile</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
