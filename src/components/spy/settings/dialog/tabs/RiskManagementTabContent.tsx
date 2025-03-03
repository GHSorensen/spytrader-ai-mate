
import React from 'react';
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { RiskManagementTabContent as RiskManagementContent } from '../../risk/RiskManagementTabContent';

interface RiskManagementTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
  currentRiskTolerance: RiskToleranceType;
}

export const RiskManagementTabContent: React.FC<RiskManagementTabContentProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
  currentRiskTolerance
}) => {
  return (
    <RiskManagementContent 
      settings={settings}
      updateSettings={updateSettings}
      updateNestedSettings={updateNestedSettings}
      currentRiskTolerance={currentRiskTolerance}
    />
  );
};
