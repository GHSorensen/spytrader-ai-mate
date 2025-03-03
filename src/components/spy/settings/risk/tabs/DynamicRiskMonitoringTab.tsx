
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from 'lucide-react';
import { RiskMonitoringCard } from '../RiskMonitoringCard';
import { RiskLearningInsightsCard } from '../RiskLearningInsightsCard';
import { toast } from "sonner";
import { RiskSignal, RiskAction, LearningInsight } from '@/lib/types/spy/riskMonitoring';

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
  // Handle scan for risks
  const handleScanForRisks = () => {
    performRiskMonitoring();
    toast.success("Risk scan completed", {
      description: `${latestSignals.length} signals detected, ${latestActions.length} actions taken`,
    });
  };
  
  // Handle toggle auto mode
  const handleToggleAutoMode = () => {
    toggleAutoMode();
    toast.success(autoMode ? "Auto mode disabled" : "Auto mode enabled", {
      description: autoMode 
        ? "Real-time risk monitoring will be paused" 
        : "AI will automatically monitor and adjust risk in real-time",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Automatic Risk Management
          </CardTitle>
          <CardDescription>
            Enable real-time monitoring and automatic risk adjustment based on market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-risk-mode" className="mb-1 block">Automatic Risk Management</Label>
              <p className="text-sm text-muted-foreground">
                AI will continuously monitor the market and adjust risk in real-time
              </p>
            </div>
            <Switch
              id="auto-risk-mode"
              checked={autoMode}
              onCheckedChange={handleToggleAutoMode}
            />
          </div>
          
          <div className="flex justify-center pt-2">
            <Button
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleScanForRisks}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Scan for risks now</span>
              {isLoading && <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="adjust-on-volatility" className="mb-1 block">Adjust on VIX Changes</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust risk based on volatility index changes
              </p>
            </div>
            <Switch
              id="adjust-on-volatility"
              checked={settings.autoAdjustVolatility}
              onCheckedChange={(checked) => updateSettings('autoAdjustVolatility', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smart-profit" className="mb-1 block">Smart Profit Taking</Label>
              <p className="text-sm text-muted-foreground">
                Dynamically adjust take-profit levels based on current market conditions
              </p>
            </div>
            <Switch
              id="smart-profit"
              checked={settings.smartProfitTaking}
              onCheckedChange={(checked) => updateSettings('smartProfitTaking', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="position-scaling" className="mb-1 block">Auto Position Scaling</Label>
              <p className="text-sm text-muted-foreground">
                Automatically scale in/out of positions based on changing market conditions
              </p>
            </div>
            <Switch
              id="position-scaling"
              checked={settings.autoPositionScaling}
              onCheckedChange={(checked) => updateSettings('autoPositionScaling', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <RiskMonitoringCard 
        isLoading={isLoading}
        latestSignals={latestSignals}
        latestActions={latestActions}
      />
      
      <RiskLearningInsightsCard insights={learningInsights} />
    </div>
  );
};
