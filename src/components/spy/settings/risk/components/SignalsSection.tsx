
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';
import { Badge } from '@/components/ui/badge';

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
  
  if (displaySignals.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Market Signals</h3>
        <div className="text-sm text-muted-foreground">
          No signals detected at this time.
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

const SignalItem = ({ signal }: { signal: RiskSignal }) => {
  const getSignalColor = () => {
    switch (signal.direction) {
      case 'bearish':
        return 'text-red-500';
      case 'bullish':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStrengthBadge = () => {
    switch (signal.strength) {
      case 'extreme':
      case 'critical':
        return <Badge variant="destructive">{signal.strength}</Badge>;
      case 'strong':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">{signal.strength}</Badge>;
      case 'moderate':
        return <Badge variant="secondary">{signal.strength}</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{signal.strength}</Badge>;
    }
  };

  return (
    <div className="border rounded-md p-3 mb-2 bg-card hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <div className={`font-medium ${getSignalColor()}`}>
          {signal.description}
        </div>
        {getStrengthBadge()}
      </div>
      <div className="text-xs text-muted-foreground">
        Source: {signal.source} • 
        Confidence: {(signal.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
};
