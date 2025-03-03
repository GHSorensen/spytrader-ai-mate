
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BarChart4 } from 'lucide-react';
import { AITradingSettings, MarketCondition } from '@/lib/types/spyOptions';
import { marketConditionDescriptions } from './AISettingsTypes';

interface MarketConditionsTabProps {
  settings: AITradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<AITradingSettings>>;
}

export const MarketConditionsTab: React.FC<MarketConditionsTabProps> = ({
  settings,
  setSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart4 className="h-5 w-5 text-primary" />
          Market Condition Adjustments
        </CardTitle>
        <CardDescription>
          Configure how the AI should adjust its strategy in different market conditions
        </CardDescription>
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
                  setSettings((prev) => ({
                    ...prev,
                    marketConditionOverrides: {
                      ...prev.marketConditionOverrides,
                      [condition]: {
                        ...current,
                        enabled: checked,
                      },
                    },
                  }));
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
                      setSettings((prev) => ({
                        ...prev,
                        marketConditionOverrides: {
                          ...prev.marketConditionOverrides,
                          [condition]: {
                            ...prev.marketConditionOverrides[condition],
                            adjustedRisk: value[0] / 100,
                          },
                        },
                      }));
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
