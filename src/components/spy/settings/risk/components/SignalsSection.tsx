
import React from 'react';
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';
import { SignalItem } from './SignalItem';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon } from 'lucide-react';

interface SignalsSectionProps {
  signals: RiskSignal[];
  isLoading: boolean;
  latestSignals?: RiskSignal[];
  getRelativeTime?: (timestamp: Date) => string;
}

export const SignalsSection: React.FC<SignalsSectionProps> = ({ 
  signals, 
  isLoading, 
  latestSignals,
  getRelativeTime 
}) => {
  // Use latestSignals if provided, otherwise use signals
  const signalsToRender = latestSignals || signals;
  
  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">Risk Signals</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-2">
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Risk Signals</h3>
      
      {signalsToRender.length === 0 ? (
        <div className="flex items-center p-4 border rounded-md bg-muted/20">
          <AlertTriangleIcon className="h-4 w-4 text-muted-foreground mr-2" />
          <p className="text-xs text-muted-foreground">
            No risk signals detected
          </p>
        </div>
      ) : (
        signalsToRender.map((signal) => (
          <SignalItem key={signal.id} signal={signal} />
        ))
      )}
    </div>
  );
};
