
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { BacktestingTab } from '../../BacktestingTab';

interface BacktestingTabContentProps {
  settings: AITradingSettings;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const BacktestingTabContent: React.FC<BacktestingTabContentProps> = ({
  settings,
  updateNestedSettings
}) => {
  return (
    <BacktestingTab 
      settings={settings}
      updateNestedSettings={updateNestedSettings}
    />
  );
};
