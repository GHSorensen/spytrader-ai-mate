
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpyTrade } from '@/lib/types/spy';
import { Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface BacktestTradeListProps {
  trades: SpyTrade[];
}

type SortField = 'openedAt' | 'profit' | 'profitPercentage' | 'type' | 'strikePrice';
type SortDirection = 'asc' | 'desc';

export const BacktestTradeList: React.FC<BacktestTradeListProps> = ({ trades }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('openedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Filter trades based on search
  const filteredTrades = trades.filter(trade => {
    const searchLower = searchQuery.toLowerCase();
    return (
      trade.type.toLowerCase().includes(searchLower) ||
      trade.strikePrice.toString().includes(searchLower) ||
      trade.status.toLowerCase().includes(searchLower)
    );
  });
  
  // Sort trades
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    switch (sortField) {
      case 'openedAt':
        return sortDirection === 'asc' 
          ? new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime()
          : new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
      case 'profit':
        return sortDirection === 'asc' 
          ? (a.profit || 0) - (b.profit || 0)
          : (b.profit || 0) - (a.profit || 0);
      case 'profitPercentage':
        return sortDirection === 'asc' 
          ? (a.profitPercentage || 0) - (b.profitPercentage || 0)
          : (b.profitPercentage || 0) - (a.profitPercentage || 0);
      case 'type':
        return sortDirection === 'asc' 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      case 'strikePrice':
        return sortDirection === 'asc' 
          ? a.strikePrice - b.strikePrice
          : b.strikePrice - a.strikePrice;
      default:
        return 0;
    }
  });
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('openedAt')}
                  className="hover:bg-transparent p-0 font-medium flex items-center"
                >
                  Date {getSortIcon('openedAt')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('type')}
                  className="hover:bg-transparent p-0 font-medium flex items-center"
                >
                  Type {getSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('strikePrice')}
                  className="hover:bg-transparent p-0 font-medium flex items-center"
                >
                  Strike {getSortIcon('strikePrice')}
                </Button>
              </TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('profit')}
                  className="hover:bg-transparent p-0 font-medium flex items-center"
                >
                  Profit ($) {getSortIcon('profit')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('profitPercentage')}
                  className="hover:bg-transparent p-0 font-medium flex items-center"
                >
                  Return (%) {getSortIcon('profitPercentage')}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No trades found.
                </TableCell>
              </TableRow>
            ) : (
              sortedTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {new Date(trade.openedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.type === 'CALL' ? 'default' : 'destructive'}>
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell>${trade.strikePrice}</TableCell>
                  <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>${trade.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className={trade.profit && trade.profit > 0 ? 'text-green-500' : 'text-red-500'}>
                    ${(trade.profit || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className={trade.profitPercentage && trade.profitPercentage > 0 ? 'text-green-500' : 'text-red-500'}>
                    {(trade.profitPercentage || 0).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.status === 'active' ? 'outline' : 'secondary'}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
