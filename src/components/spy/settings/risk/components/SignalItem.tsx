
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';

interface SignalItemProps {
  signal: RiskSignal;
}

export const SignalItem: React.FC<SignalItemProps> = ({ signal }) => {
  const getSignalColor = () => {
    if (signal.direction === 'bullish') return 'text-green-500';
    if (signal.direction === 'bearish') return 'text-red-500';
    return 'text-blue-500';
  };

  const getStrengthBadge = () => {
    switch (signal.strength) {
      case 'extreme':
        return <Badge variant="destructive">Extreme</Badge>;
      case 'strong':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Strong</Badge>;
      case 'moderate':
        return <Badge variant="outline">Moderate</Badge>;
      case 'weak':
        return <Badge variant="secondary">Weak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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
        <span className="capitalize">{signal.source}</span> signal • 
        <span className="ml-1">{signal.condition}</span> market •
        <span className="ml-1">{Math.round(signal.confidence * 100)}% confidence</span>
      </div>
    </div>
  );
};
