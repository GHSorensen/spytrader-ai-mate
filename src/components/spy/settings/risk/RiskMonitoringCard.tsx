
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle } from 'lucide-react';
import { 
  RiskSignal, 
  RiskAction
} from '@/lib/types/spy/riskMonitoring';
import { SignalsSection } from './components/SignalsSection';
import { ActionsSection } from './components/ActionsSection';
import { useRelativeTime } from '@/hooks/useRelativeTime';

interface RiskMonitoringCardProps {
  isLoading?: boolean;
  latestSignals?: RiskSignal[];
  latestActions?: RiskAction[];
  signals?: RiskSignal[];
  actions?: RiskAction[];
  settings?: any;
  updateSettings?: any;
}

export const RiskMonitoringCard: React.FC<RiskMonitoringCardProps> = ({
  isLoading = false,
  latestSignals = [],
  latestActions = [],
  signals = [],
  actions = [],
  settings,
  updateSettings
}) => {
  // Use our custom hook for relative time formatting
  const getRelativeTime = useRelativeTime();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Real-time Risk Monitoring
        </CardTitle>
        <CardDescription>
          Latest market signals and automated risk actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <SignalsSection 
              signals={signals}
              latestSignals={latestSignals}
              getRelativeTime={getRelativeTime}
              isLoading={isLoading}
            />
            
            <ActionsSection 
              actions={actions}
              latestActions={latestActions}
              getRelativeTime={getRelativeTime}
              isLoading={isLoading}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
