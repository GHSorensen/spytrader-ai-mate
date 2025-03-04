
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { getSpyMarketData } from '@/services/spyOptionsService';
import { ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SpyOverview = () => {
  const { data: spyData, isLoading } = useQuery({
    queryKey: ['spyMarketData'],
    queryFn: getSpyMarketData,
    refetchInterval: 60000, // Refresh every minute
  });

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
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">SPY Overview</CardTitle>
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
