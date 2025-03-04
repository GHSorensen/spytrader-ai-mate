
import React from 'react';
import { AITradingSettings, MarketCondition } from '@/lib/types/spy';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingDown, TrendingUp, Activity, Gauge } from 'lucide-react';
import { marketConditionDescriptions } from '@/components/spy/settings/AISettingsTypes';

interface MarketConditionCardProps {
  condition: MarketCondition;
  override: {
    enabled: boolean;
    adjustedRisk: number;
  };
  updateMarketConditionOverride: (
    condition: MarketCondition, 
    key: 'enabled' | 'adjustedRisk', 
    value: any
  ) => void;
}

export const MarketConditionCard: React.FC<MarketConditionCardProps> = ({
  condition,
  override,
  updateMarketConditionOverride
}) => {
  // Function to get the icon for each market condition
  const getMarketConditionIcon = (condition: MarketCondition) => {
    switch (condition) {
      case 'bullish': return <TrendingUp className="h-5 w-5 text-positive" />;
      case 'bearish': return <TrendingDown className="h-5 w-5 text-negative" />;
      case 'neutral': return <Gauge className="h-5 w-5 text-muted-foreground" />;
      case 'volatile': return <Activity className="h-5 w-5 text-warning" />;
    }
  };

  // Determine adjustment description based on risk level
  const getRiskAdjustmentDescription = (riskLevel: number) => {
    if (riskLevel < 0.3) return "Very Conservative";
    if (riskLevel < 0.6) return "Moderate";
    if (riskLevel < 0.9) return "Aggressive";
    return "Very Aggressive";
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getMarketConditionIcon(condition)}
          <span className="font-medium capitalize">{condition} Market</span>
        </div>
        <Switch
          checked={override.enabled || false}
          onCheckedChange={(checked) => updateMarketConditionOverride(condition, 'enabled', checked)}
        />
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {marketConditionDescriptions[condition]}
      </p>
      
      {override.enabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Risk Adjustment</Label>
            <span className="text-sm font-medium">
              {getRiskAdjustmentDescription(override.adjustedRisk || 0.5)}
            </span>
          </div>
          <Slider
            value={[override.adjustedRisk ? override.adjustedRisk * 100 : 50]}
            min={10}
            max={120}
            step={5}
            onValueChange={(value) => updateMarketConditionOverride(condition, 'adjustedRisk', value[0] / 100)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10% Risk</span>
            <span>Normal</span>
            <span>120% Risk</span>
          </div>
        </div>
      )}
    </div>
  );
};
