
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { MarketConditionsTab } from '../../MarketConditionsTab';

interface MarketConditionsTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const MarketConditionsTabContent: React.FC<MarketConditionsTabContentProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <MarketConditionsTab 
      settings={settings}
      updateSettings={updateSettings}
    />
  );
};
