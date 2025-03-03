
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { PositionSizingCard } from './risk/PositionSizingCard';
import { StopLossCard } from './risk/StopLossCard';
import { TakeProfitCard } from './risk/TakeProfitCard';
import { ConfidenceScoreCard } from './risk/ConfidenceScoreCard';

interface RiskManagementTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const RiskManagementTab: React.FC<RiskManagementTabProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
}) => {
  return (
    <div className="space-y-4">
      <PositionSizingCard 
        positionSizing={settings.positionSizing}
        updateNestedSettings={updateNestedSettings}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StopLossCard 
          stopLossSettings={settings.stopLossSettings}
          updateNestedSettings={updateNestedSettings}
        />
        
        <TakeProfitCard 
          takeProfitSettings={settings.takeProfitSettings}
          updateNestedSettings={updateNestedSettings}
        />
      </div>
      
      <ConfidenceScoreCard 
        minimumConfidenceScore={settings.minimumConfidenceScore}
        updateSettings={updateSettings}
      />
    </div>
  );
};
