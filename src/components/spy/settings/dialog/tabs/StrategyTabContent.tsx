
import React from 'react';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { StrategyTab } from '../../StrategyTab';

interface StrategyTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  currentRiskTolerance: RiskToleranceType;
  onRiskToleranceChange: (tolerance: RiskToleranceType) => void;
}

export const StrategyTabContent: React.FC<StrategyTabContentProps> = ({
  settings,
  updateSettings,
  currentRiskTolerance,
  onRiskToleranceChange
}) => {
  return (
    <StrategyTab 
      settings={settings}
      updateSettings={updateSettings}
      currentRiskTolerance={currentRiskTolerance}
      onRiskToleranceChange={onRiskToleranceChange}
    />
  );
};
