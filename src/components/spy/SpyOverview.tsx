
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, BarChart2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIBKRMarketData } from '@/hooks/ibkr/useIBKRMarketData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const SpyOverview = () => {
  const { 
    marketData: spyData, 
    isLoading, 
    refetch, 
    isFetching,
    lastUpdated 
  } = useIBKRMarketData({
    pollingInterval: 60000, // Poll every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    cacheTime: 600000 // Keep in cache for 10 minutes
  });

  const handleManualRefresh = () => {
    refetch();
    toast.info("Refreshing market data...");
  };

  if (isLoading) {
    return (
      <Card className="col-span-3 animate-pulse">
        <CardHeader className="space-y-2 p-4 md:p-6">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = spyData && spyData.change > 0;
  
  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">SPY Overview</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isFetching && "animate-spin")} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {spyData && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Current Price</p>
              <p className="text-xl md:text-2xl font-bold">${spyData.price.toFixed(2)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Change</p>
              <div className="flex items-center gap-1">
                {isPositive ? <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-positive" /> : <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-negative" />}
                <p className={cn("text-xl md:text-2xl font-bold", isPositive ? "text-positive" : "text-negative")}>
                  {isPositive ? "+" : ""}{spyData.change.toFixed(2)} ({spyData.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Volume</p>
              <p className="text-xl md:text-2xl font-bold">{(spyData.volume / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">
                Avg: {(spyData.averageVolume / 1000000).toFixed(1)}M
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">VIX</p>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                <p className="text-xl md:text-2xl font-bold">{spyData.vix.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Day Range</p>
              <p className="text-base md:text-lg font-medium">${spyData.low.toFixed(2)} - ${spyData.high.toFixed(2)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Open</p>
              <p className="text-base md:text-lg font-medium">${spyData.open.toFixed(2)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Previous Close</p>
              <p className="text-base md:text-lg font-medium">${spyData.previousClose.toFixed(2)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Last Update</p>
              <p className="text-base md:text-lg font-medium">
                {spyData.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
