
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpyTrade } from '@/lib/types/spy';

interface TradeTableProps {
  trades: SpyTrade[];
  isLoading: boolean;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, isLoading }) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

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

export default TradeTable;
