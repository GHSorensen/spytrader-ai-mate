
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { PositionSizingCard } from './risk/PositionSizingCard';
import { StopLossCard } from './risk/StopLossCard';
import { TakeProfitCard } from './risk/TakeProfitCard';
import { ConfidenceScoreCard } from './risk/ConfidenceScoreCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Shield, BarChart } from 'lucide-react';

interface RiskManagementTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const RiskManagementTab: React.FC<RiskManagementTabProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
}) => {
  return (
    <div className="space-y-4">
      <PositionSizingCard 
        positionSizing={settings.positionSizing}
        updateNestedSettings={updateNestedSettings}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StopLossCard 
          stopLossSettings={settings.stopLossSettings}
          updateNestedSettings={updateNestedSettings}
        />
        
        <TakeProfitCard 
          takeProfitSettings={settings.takeProfitSettings}
          updateNestedSettings={updateNestedSettings}
        />
      </div>
      
      <ConfidenceScoreCard 
        minimumConfidenceScore={settings.minimumConfidenceScore}
        updateSettings={updateSettings}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Advanced Risk Protection
          </CardTitle>
          <CardDescription>
            Additional safeguards to protect your portfolio during adverse conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-hedging" className="mb-1 block">Enable Hedging</Label>
              <p className="text-sm text-muted-foreground">Automatically add hedge positions during high risk periods</p>
            </div>
            <Switch
              id="enable-hedging"
              checked={settings.enableHedging}
              onCheckedChange={(checked) => updateSettings('enableHedging', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="adaptive-position-sizing" className="mb-1 block">Adaptive Position Sizing</Label>
              <p className="text-sm text-muted-foreground">Dynamically adjust position size based on market conditions</p>
            </div>
            <Switch
              id="adaptive-position-sizing"
              checked={settings.adaptivePositionSizing}
              onCheckedChange={(checked) => updateSettings('adaptivePositionSizing', checked)}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label>Max Capital Deployment (%)</Label>
              <span className="text-sm font-medium">{settings.maxCapitalDeployment}%</span>
            </div>
            <Slider
              value={[settings.maxCapitalDeployment]}
              min={10}
              max={100}
              step={5}
              onValueChange={(value) => updateSettings('maxCapitalDeployment', value[0])}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Maximum percentage of portfolio value that can be deployed at any time
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Analysis Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Technical vs. Fundamental Analysis</Label>
            <Slider
              value={[settings.technicalFundamentalBalance]}
              min={0}
              max={100}
              step={10}
              onValueChange={(value) => updateSettings('technicalFundamentalBalance', value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100% Fundamental</span>
              <span>Balanced</span>
              <span>100% Technical</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current: {settings.technicalFundamentalBalance}% technical focus
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label>Short-term vs. Long-term Timeframe</Label>
            <Slider
              value={[settings.shortLongTimeframeBalance]}
              min={0}
              max={100}
              step={10}
              onValueChange={(value) => updateSettings('shortLongTimeframeBalance', value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Long-term</span>
              <span>Balanced</span>
              <span>Short-term</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current: {settings.shortLongTimeframeBalance}% short-term focus
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
