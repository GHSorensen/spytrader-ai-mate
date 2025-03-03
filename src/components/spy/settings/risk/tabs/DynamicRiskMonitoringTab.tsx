
import React from 'react';
import { RiskMonitoringCard } from '../RiskMonitoringCard';
import { RiskInsights } from '../RiskInsights';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AITradingSettings } from '@/lib/types/spy';
import { RiskSignal, RiskAction, LearningInsight } from '@/lib/types/spy/riskMonitoring';
import { AlertCircle } from 'lucide-react';

interface DynamicRiskMonitoringTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  isLoading: boolean;
  latestSignals: RiskSignal[];
  latestActions: RiskAction[];
  learningInsights: LearningInsight[];
  autoMode: boolean;
  performRiskMonitoring: () => void;
  toggleAutoMode: () => void;
}

export const DynamicRiskMonitoringTab: React.FC<DynamicRiskMonitoringTabProps> = ({
  settings,
  updateSettings,
  isLoading,
  latestSignals,
  latestActions,
  learningInsights,
  autoMode,
  performRiskMonitoring,
  toggleAutoMode
}) => {
  return (
    <div className="space-y-6">
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
      
      <RiskMonitoringCard 
        isLoading={isLoading}
        latestSignals={latestSignals}
        latestActions={latestActions}
        settings={settings}
        updateSettings={updateSettings}
      />
      
      <RiskInsights 
        signals={latestSignals}
        actions={latestActions}
        insights={learningInsights}
        isLoading={isLoading}
      />
    </div>
  );
};
