
import React from 'react';
import { AITradingSettings, MarketCondition, RiskToleranceType } from '@/lib/types/spy';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import { MarketConditionCard } from './MarketConditionCard';
import { marketConditionDescriptions, getMarketConditionOverridesByRiskTolerance } from '@/components/spy/settings/AISettingsTypes';

interface MarketConditionsSectionProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  currentRiskTolerance: RiskToleranceType;
}

export const MarketConditionsSection: React.FC<MarketConditionsSectionProps> = ({
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

  return (
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
            <label htmlFor="auto-adjust-volatility" className="text-sm font-medium">Auto-adjust for Volatility</label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="auto-adjust-volatility"
                className="sr-only"
                checked={settings.autoAdjustVolatility}
                onChange={(e) => updateSettings('autoAdjustVolatility', e.target.checked)}
              />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically reduce position sizes and apply stricter risk controls during high volatility periods
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="use-market-sentiment" className="text-sm font-medium">Use Market Sentiment Analysis</label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="use-market-sentiment"
                className="sr-only"
                checked={settings.useMarketSentiment}
                onChange={(e) => updateSettings('useMarketSentiment', e.target.checked)}
              />
            </label>
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
              <MarketConditionCard 
                key={condition}
                condition={condition}
                override={override}
                updateMarketConditionOverride={updateMarketConditionOverride}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
