
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { RiskManagementTab } from '../../RiskManagementTab';

interface RiskManagementTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const RiskManagementTabContent: React.FC<RiskManagementTabContentProps> = ({
  settings,
  updateSettings,
  updateNestedSettings
}) => {
  return (
    <RiskManagementTab 
      settings={settings}
      updateSettings={updateSettings}
      updateNestedSettings={updateNestedSettings}
    />
  );
};
