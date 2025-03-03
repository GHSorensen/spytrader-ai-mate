
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { SignalsSection } from './SignalsSection';
import { ActionsSection } from './ActionsSection';
import { RiskSignal, RiskAction } from '@/lib/types/spy/riskMonitoring';

interface RiskInsightsContentProps {
  signals: RiskSignal[];
  actions: RiskAction[];
  isLoading: boolean;
}

export const RiskInsightsContent: React.FC<RiskInsightsContentProps> = ({
  signals,
  actions,
  isLoading
}) => {
  // Get the most recent 5 signals and actions for display
  const recentSignals = [...signals].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);
  
  const recentActions = [...actions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SignalsSection signals={recentSignals} isLoading={isLoading} />
        <ActionsSection actions={recentActions} isLoading={isLoading} />
      </div>
    </CardContent>
  );
};
