
import React from 'react';
import { AITradingSettings } from '@/lib/types/spy';
import { PositionSizingCard } from '../PositionSizingCard';
import { StopLossCard } from '../StopLossCard';
import { TakeProfitCard } from '../TakeProfitCard';
import { ConfidenceScoreCard } from '../ConfidenceScoreCard';
import { AdvancedRiskProtectionCard } from './basic/AdvancedRiskProtectionCard';
import { AnalysisBalanceCard } from './basic/AnalysisBalanceCard';

interface BasicRiskSettingsTabProps {
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
}

export const BasicRiskSettingsTab: React.FC<BasicRiskSettingsTabProps> = ({
  settings,
  updateSettings,
  updateNestedSettings,
}) => {
  return (
    <div className="space-y-6">
      <PositionSizingCard 
        positionSizing={settings.positionSizing}
        updateNestedSettings={updateNestedSettings}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <AdvancedRiskProtectionCard 
        settings={settings}
        updateSettings={updateSettings}
      />
      
      <AnalysisBalanceCard
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};
