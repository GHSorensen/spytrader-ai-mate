
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Activity } from 'lucide-react';

interface VolatilityThresholdsProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const VolatilityThresholds: React.FC<VolatilityThresholdsProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Volatility Thresholds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>VIX Threshold for Risk Reduction</Label>
            <span className="text-sm font-medium">{settings.volatilityThreshold}</span>
          </div>
          <Slider
            value={[settings.volatilityThreshold]}
            min={15}
            max={40}
            step={1}
            onValueChange={(value) => updateSettings('volatilityThreshold', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (15)</span>
            <span>Medium (25)</span>
            <span>High (40)</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            When VIX exceeds this level, risk will be automatically reduced according to your settings
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Daily Loss Limit (%)</Label>
            <span className="text-sm font-medium">{settings.dailyLossLimitPct}%</span>
          </div>
          <Slider
            value={[settings.dailyLossLimitPct]}
            min={1}
            max={10}
            step={0.5}
            onValueChange={(value) => updateSettings('dailyLossLimitPct', value[0])}
          />
          <p className="text-sm text-muted-foreground mt-1">
            AI will pause trading if daily losses reach this percentage of account value
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
