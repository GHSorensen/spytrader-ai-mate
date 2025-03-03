
import React from 'react';
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';
import { SignalItem } from './SignalItem';

interface SignalsSectionProps {
  latestSignals: RiskSignal[];
  getRelativeTime: (timestamp: Date) => string;
}

export const SignalsSection: React.FC<SignalsSectionProps> = ({
  latestSignals,
  getRelativeTime
}) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Recent Market Signals</h3>
      {latestSignals.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No recent signals detected</p>
      ) : (
        <div className="space-y-2">
          {latestSignals.slice(0, 5).map(signal => (
            <SignalItem 
              key={signal.id} 
              signal={signal} 
              getRelativeTime={getRelativeTime} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
