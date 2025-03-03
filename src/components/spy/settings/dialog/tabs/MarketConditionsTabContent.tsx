
import React from 'react';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { MarketConditionsTab } from '../../MarketConditionsTab';

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
    <MarketConditionsTab 
      settings={settings}
      updateSettings={updateSettings}
      currentRiskTolerance={currentRiskTolerance}
    />
  );
};
