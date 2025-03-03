
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { AdvancedTab } from '../../AdvancedTab';

interface AdvancedTabContentProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const AdvancedTabContent: React.FC<AdvancedTabContentProps> = ({
  settings,
  updateSettings
}) => {
  return (
    <AdvancedTab 
      settings={settings}
      updateSettings={updateSettings}
    />
  );
};
