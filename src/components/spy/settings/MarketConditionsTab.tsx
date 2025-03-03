
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BarChart4, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AITradingSettings, MarketCondition, RiskToleranceType } from '@/lib/types/spy';
import { marketConditionDescriptions, getMarketConditionOverridesByRiskTolerance } from './AISettingsTypes';

interface MarketConditionsTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  currentRiskTolerance?: RiskToleranceType;
}

export const MarketConditionsTab: React.FC<MarketConditionsTabProps> = ({
  settings,
  updateSettings,
  currentRiskTolerance = 'moderate',
}) => {
  // Function to apply risk-tolerance-based settings
  const applyRiskBasedSettings = () => {
    const recommendedOverrides = getMarketConditionOverridesByRiskTolerance(currentRiskTolerance);
    updateSettings('marketConditionOverrides', recommendedOverrides);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-primary" />
              Market Condition Adjustments
            </CardTitle>
            <CardDescription>
              Configure how the AI should adjust its strategy in different market conditions
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={applyRiskBasedSettings}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Auto-optimize for {currentRiskTolerance}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(marketConditionDescriptions) as MarketCondition[]).map((condition) => (
          <div key={condition} className="space-y-2 border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium capitalize">{condition}</h4>
                <p className="text-sm text-muted-foreground">
                  {marketConditionDescriptions[condition]}
                </p>
              </div>
              <Switch
                checked={settings.marketConditionOverrides[condition]?.enabled || false}
                onCheckedChange={(checked) => {
                  const current = settings.marketConditionOverrides[condition] || { adjustedRisk: 0.8 };
                  const updatedOverrides = {
                    ...settings.marketConditionOverrides,
                    [condition]: {
                      ...current,
                      enabled: checked,
                    },
                  };
                  updateSettings('marketConditionOverrides', updatedOverrides);
                }}
              />
            </div>
            
            {settings.marketConditionOverrides[condition]?.enabled && (
              <div className="space-y-2 pt-2">
                <Label>Risk Adjustment ({((settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) * 100).toFixed(0)}%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[(settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) * 100]}
                    min={10}
                    max={120}
                    step={5}
                    onValueChange={(value) => {
                      const updatedOverrides = {
                        ...settings.marketConditionOverrides,
                        [condition]: {
                          ...settings.marketConditionOverrides[condition],
                          adjustedRisk: value[0] / 100,
                        },
                      };
                      updateSettings('marketConditionOverrides', updatedOverrides);
                    }}
                    className="flex-1"
                  />
                  <span className="w-16 text-center">
                    {((settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(settings.marketConditionOverrides[condition]?.adjustedRisk || 0.8) > 1 
                    ? 'Increase risk compared to baseline strategy' 
                    : 'Reduce risk compared to baseline strategy'}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
