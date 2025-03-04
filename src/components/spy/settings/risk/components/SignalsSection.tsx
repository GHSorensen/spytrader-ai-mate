
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';
import { SignalItem } from './SignalItem';

interface SignalsSectionProps {
  signals: RiskSignal[];
  latestSignals?: RiskSignal[];
  isLoading?: boolean;
  getRelativeTime?: (date: Date) => string;
}

export const SignalsSection: React.FC<SignalsSectionProps> = ({
  signals,
  latestSignals,
  isLoading = false,
  getRelativeTime
}) => {
  const displaySignals = latestSignals || signals;
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Market Signals</h3>
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }
  
  if (!displaySignals || displaySignals.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Market Signals</h3>
        <div className="text-sm text-muted-foreground">
          No market signals detected.
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Market Signals</h3>
      <div className="max-h-[300px] overflow-y-auto pr-1">
        {displaySignals.map(signal => (
          <SignalItem key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
};
