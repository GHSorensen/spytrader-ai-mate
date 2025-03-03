
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { RiskManagementTabContent } from './risk/RiskManagementTabContent';

interface RiskManagementTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
  currentRiskTolerance: string;
}

export const RiskManagementTab: React.FC<RiskManagementTabProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
  currentRiskTolerance,
}) => {
  return (
    <RiskManagementTabContent
      settings={settings}
      updateSettings={updateSettings}
      updateNestedSettings={updateNestedSettings}
      currentRiskTolerance={currentRiskTolerance as any}
    />
  );
};
