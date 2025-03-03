
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpyOption } from '@/lib/types/spy';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

interface OptionChainProps {
  options?: SpyOption[];
}

export const OptionChain: React.FC<OptionChainProps> = ({ options: propOptions }) => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [optionType, setOptionType] = useState<'all' | 'CALL' | 'PUT'>('all');
  const [sortBy, setSortBy] = useState<'strikePrice' | 'premium' | 'impliedVolatility' | 'openInterest'>('strikePrice');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showInTheMoney, setShowInTheMoney] = useState(true);
  const [showOutOfTheMoney, setShowOutOfTheMoney] = useState(true);

  // Fetch options data using the data provider
  const { data: fetchedOptions, isLoading } = useQuery({
    queryKey: ['optionChain'],
    queryFn: async () => {
      const provider = getDataProvider();
      return provider.getOptions();
    },
    // Only fetch if no options are provided as props
    enabled: !propOptions,
  });

  // Use provided options or fetched options
  const options = propOptions || fetchedOptions || [];

  // Current SPY price (mock for now, should be fetched from market data)
  const currentSpyPrice = 500; // Mock price

  // Filter and sort options
  const filteredOptions = useMemo(() => {
    return options
      .filter(option => {
        // Filter by search term (strike price)
        if (searchTerm && !option.strikePrice.toString().includes(searchTerm)) {
          return false;
        }
        
        // Filter by option type
        if (optionType !== 'all' && option.type !== optionType) {
          return false;
        }
        
        // Filter by in-the-money / out-of-the-money
        const isInTheMoney = (option.type === 'CALL' && option.strikePrice < currentSpyPrice) || 
                            (option.type === 'PUT' && option.strikePrice > currentSpyPrice);
        
        if (isInTheMoney && !showInTheMoney) return false;
        if (!isInTheMoney && !showOutOfTheMoney) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Fallback for non-numeric fields
        return sortDirection === 'asc' ? 
          String(aValue).localeCompare(String(bValue)) : 
          String(bValue).localeCompare(String(aValue));
      });
  }, [options, searchTerm, optionType, sortBy, sortDirection, showInTheMoney, showOutOfTheMoney, currentSpyPrice]);

  // Format expiration date
  const formatExpirationDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Toggle sort direction
  const toggleSort = (field: 'strikePrice' | 'premium' | 'impliedVolatility' | 'openInterest') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>SPY Option Chain</CardTitle>
          <Badge variant="outline" className="ml-2">
            SPY: ${currentSpyPrice.toFixed(2)}
          </Badge>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by strike price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={optionType} onValueChange={(value: 'all' | 'CALL' | 'PUT') => setOptionType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Option Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CALL">Calls Only</SelectItem>
              <SelectItem value="PUT">Puts Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => document.getElementById('filterDialog')?.click()}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="itm-switch"
              checked={showInTheMoney}
              onCheckedChange={setShowInTheMoney}
            />
            <Label htmlFor="itm-switch">ITM</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="otm-switch"
              checked={showOutOfTheMoney}
              onCheckedChange={setShowOutOfTheMoney}
            />
            <Label htmlFor="otm-switch">OTM</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px] w-full overflow-x-auto">
          <div className="relative min-w-[800px]">
            <table className="w-full text-sm">
              <thead className="[&_th]:px-4 [&_th]:py-2 [&_th]:text-left border-b sticky top-0 bg-secondary text-secondary-foreground">
                <tr>
                  <th 
                    className="cursor-pointer hover:bg-secondary/80" 
                    onClick={() => toggleSort('strikePrice')}
                  >
                    <div className="flex items-center">
                      Strike
                      {sortBy === 'strikePrice' && (
                        <ArrowUpDown className={cn(
                          "ml-1 h-4 w-4", 
                          sortDirection === 'asc' ? "rotate-0" : "rotate-180"
                        )} />
                      )}
                    </div>
                  </th>
                  <th>Type</th>
                  <th>Expiration</th>
                  <th 
                    className="cursor-pointer hover:bg-secondary/80" 
                    onClick={() => toggleSort('premium')}
                  >
                    <div className="flex items-center">
                      Premium
                      {sortBy === 'premium' && (
                        <ArrowUpDown className={cn(
                          "ml-1 h-4 w-4", 
                          sortDirection === 'asc' ? "rotate-0" : "rotate-180"
                        )} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="cursor-pointer hover:bg-secondary/80" 
                    onClick={() => toggleSort('impliedVolatility')}
                  >
                    <div className="flex items-center">
                      IV
                      {sortBy === 'impliedVolatility' && (
                        <ArrowUpDown className={cn(
                          "ml-1 h-4 w-4", 
                          sortDirection === 'asc' ? "rotate-0" : "rotate-180"
                        )} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleSort('openInterest')}
                  >
                    <div className="flex items-center">
                      Open Int
                      {sortBy === 'openInterest' && (
                        <ArrowUpDown className={cn(
                          "ml-1 h-4 w-4", 
                          sortDirection === 'asc' ? "rotate-0" : "rotate-180"
                        )} />
                      )}
                    </div>
                  </th>
                  <th>Volume</th>
                  <th>Delta</th>
                  <th>Gamma</th>
                  <th>Theta</th>
                  <th>Vega</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-20">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isInTheMoney = (option.type === 'CALL' && option.strikePrice < currentSpyPrice) || 
                                       (option.type === 'PUT' && option.strikePrice > currentSpyPrice);
                    
                    return (
                      <tr 
                        key={option.id} 
                        className={cn(
                          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                          isInTheMoney ? "bg-muted/20" : ""
                        )}
                      >
                        <td className="px-4 py-2 font-medium">${option.strikePrice.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <Badge 
                            variant={option.type === 'CALL' ? 'default' : 'secondary'}
                            className={option.type === 'CALL' ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : 
                                                               'bg-red-500/20 text-red-700 hover:bg-red-500/30'}
                          >
                            {option.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{formatExpirationDate(option.expirationDate)}</td>
                        <td className="px-4 py-2">${option.premium?.toFixed(2) || 'N/A'}</td>
                        <td className="px-4 py-2">{(option.impliedVolatility * 100).toFixed(2)}%</td>
                        <td className="px-4 py-2">{option.openInterest?.toLocaleString() || 'N/A'}</td>
                        <td className="px-4 py-2">{option.volume?.toLocaleString() || 'N/A'}</td>
                        <td className="px-4 py-2">{option.delta?.toFixed(3) || 'N/A'}</td>
                        <td className="px-4 py-2">{option.gamma?.toFixed(4) || 'N/A'}</td>
                        <td className="px-4 py-2">{option.theta?.toFixed(3) || 'N/A'}</td>
                        <td className="px-4 py-2">{option.vega?.toFixed(3) || 'N/A'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-muted-foreground">
                      No options found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
