
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSpyMarketData } from '@/services/spyOptionsService';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SpyHeader = () => {
  const { data: spyData, isLoading } = useQuery({
    queryKey: ['spyMarketData'],
    queryFn: getSpyMarketData,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center h-14 animate-pulse">
        <div className="h-8 bg-muted rounded w-32"></div>
      </div>
    );
  }

  const isPositive = spyData && spyData.change > 0;
  
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-bold">SPY</h1>
      {spyData && (
        <>
          <div className="text-xl font-semibold">${spyData.price.toFixed(2)}</div>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-positive" : "text-negative"
          )}>
            {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>
              {isPositive ? "+" : ""}{spyData.change.toFixed(2)} ({spyData.changePercent.toFixed(2)}%)
            </span>
          </div>
        </>
      )}
    </div>
  );
};
