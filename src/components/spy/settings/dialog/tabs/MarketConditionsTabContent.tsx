
import React from 'react';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { MarketConditionsSection } from './market-conditions/MarketConditionsSection';
import { EventRiskControls } from './market-conditions/EventRiskControls';
import { VolatilityThresholds } from './market-conditions/VolatilityThresholds';

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
  return (
    <div className="space-y-4">
      <MarketConditionsSection 
        settings={settings}
        updateSettings={updateSettings}
        currentRiskTolerance={currentRiskTolerance}
      />

      <EventRiskControls 
        settings={settings}
        updateSettings={updateSettings}
      />

      <VolatilityThresholds 
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};
