
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { RiskSignal } from '@/lib/types/spy/riskMonitoring';

interface RiskMonitoringControlsProps {
  autoMode: boolean;
  toggleAutoMode: () => void;
  performRiskMonitoring: () => void;
  isLoading: boolean;
  latestSignals: RiskSignal[];
}

export const RiskMonitoringControls: React.FC<RiskMonitoringControlsProps> = ({
  autoMode,
  toggleAutoMode,
  performRiskMonitoring,
  isLoading,
  latestSignals
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-risk-monitoring"
            checked={autoMode}
            onCheckedChange={toggleAutoMode}
          />
          <Label htmlFor="auto-risk-monitoring" className="font-medium">
            Automatic Risk Monitoring
          </Label>
        </div>
        <Button 
          onClick={performRiskMonitoring} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          Run Risk Analysis
        </Button>
      </div>
      
      {latestSignals.length === 0 && !isLoading && (
        <div className="flex items-center p-4 border rounded-md bg-muted/40">
          <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
          <p className="text-sm text-muted-foreground">
            No risk signals detected yet. Run a risk analysis to get started.
          </p>
        </div>
      )}
    </>
  );
};
