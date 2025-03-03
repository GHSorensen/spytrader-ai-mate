
import React from 'react';
import { AITradingSettings, RiskToleranceType, MarketCondition } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Gauge, TrendingDown, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { 
  marketConditionDescriptions, 
  getMarketConditionOverridesByRiskTolerance 
} from '@/components/spy/settings/AISettingsTypes';

interface MarketConditionsTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  currentRiskTolerance: RiskToleranceType;
}

export const MarketConditionsTabContent: React.FC<MarketConditionsTabContentProps> = ({
  settings,
  updateSettings,
  currentRiskTolerance
}) => {
  // Dynamically get the market condition overrides based on risk tolerance
  const handleApplyRiskToleranceDefaults = () => {
    const marketConditionOverrides = getMarketConditionOverridesByRiskTolerance(currentRiskTolerance);
    updateSettings('marketConditionOverrides', marketConditionOverrides);
  };

  // Update a specific market condition override
  const updateMarketConditionOverride = (
    condition: MarketCondition, 
    key: keyof (typeof settings.marketConditionOverrides)[MarketCondition], 
    value: any
  ) => {
    const newOverrides = { ...settings.marketConditionOverrides };
    
    if (!newOverrides[condition]) {
      newOverrides[condition] = { enabled: true, adjustedRisk: 0.5 };
    }
    
    newOverrides[condition] = {
      ...newOverrides[condition],
      [key]: value
    };
    
    updateSettings('marketConditionOverrides', newOverrides);
  };

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Market Condition Risk Management
          </CardTitle>
          <CardDescription>
            Configure how the AI adapts to different market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="auto-adjust-volatility">Auto-adjust for Volatility</Label>
              <Switch
                id="auto-adjust-volatility"
                checked={settings.autoAdjustVolatility}
                onCheckedChange={(checked) => updateSettings('autoAdjustVolatility', checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically reduce position sizes and apply stricter risk controls during high volatility periods
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="use-market-sentiment">Use Market Sentiment Analysis</Label>
              <Switch
                id="use-market-sentiment"
                checked={settings.useMarketSentiment}
                onCheckedChange={(checked) => updateSettings('useMarketSentiment', checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Incorporate social media, news sentiment, and market breadth indicators into trading decisions
            </p>
          </div>

          <div className="flex items-center justify-end mb-6">
            <button 
              onClick={handleApplyRiskToleranceDefaults}
              className="px-3 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
            >
              Apply {currentRiskTolerance} market condition defaults
            </button>
          </div>

          <div className="space-y-4">
            {(Object.keys(marketConditionDescriptions) as MarketCondition[]).map((condition) => {
              const override = settings.marketConditionOverrides[condition] || { enabled: false, adjustedRisk: 0.5 };
              
              return (
                <div key={condition} className="border rounded-lg p-4">
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
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Event-Based Risk Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="consider-earnings" className="mb-1 block">Consider Earnings Events</Label>
              <p className="text-sm text-muted-foreground">Adjust risk around earnings announcements</p>
            </div>
            <Switch
              id="consider-earnings"
              checked={settings.considerEarningsEvents}
              onCheckedChange={(checked) => updateSettings('considerEarningsEvents', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="consider-fed-meetings" className="mb-1 block">Consider Fed Meetings</Label>
              <p className="text-sm text-muted-foreground">Adapt strategy around Federal Reserve announcements</p>
            </div>
            <Switch
              id="consider-fed-meetings"
              checked={settings.considerFedMeetings}
              onCheckedChange={(checked) => updateSettings('considerFedMeetings', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="consider-economic-data" className="mb-1 block">Consider Economic Data</Label>
              <p className="text-sm text-muted-foreground">Adjust for major economic reports (CPI, GDP, etc.)</p>
            </div>
            <Switch
              id="consider-economic-data"
              checked={settings.considerEconomicData}
              onCheckedChange={(checked) => updateSettings('considerEconomicData', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="consider-geopolitical" className="mb-1 block">Consider Geopolitical Events</Label>
              <p className="text-sm text-muted-foreground">Adjust risk during major geopolitical developments</p>
            </div>
            <Switch
              id="consider-geopolitical"
              checked={settings.considerGeopoliticalEvents}
              onCheckedChange={(checked) => updateSettings('considerGeopoliticalEvents', checked)}
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};
