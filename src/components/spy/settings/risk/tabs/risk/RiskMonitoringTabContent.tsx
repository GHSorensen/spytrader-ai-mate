
import React from 'react';
import { RiskMonitoringControls } from './RiskMonitoringControls';
import { RiskMonitoringCard } from '../../RiskMonitoringCard';
import { AITradingSettings } from '@/lib/types/spy';
import { RiskSignal, RiskAction } from '@/lib/types/spy/riskMonitoring';

interface RiskMonitoringTabContentProps {
  autoMode: boolean;
  toggleAutoMode: () => void;
  performRiskMonitoring: () => void;
  isLoading: boolean;
  latestSignals: RiskSignal[];
  latestActions: RiskAction[];
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const RiskMonitoringTabContent: React.FC<RiskMonitoringTabContentProps> = ({
  autoMode,
  toggleAutoMode,
  performRiskMonitoring,
  isLoading,
  latestSignals,
  latestActions,
  settings,
  updateSettings
}) => {
  return (
    <div className="space-y-4 pt-2">
      <RiskMonitoringControls
        autoMode={autoMode}
        toggleAutoMode={toggleAutoMode}
        performRiskMonitoring={performRiskMonitoring}
        isLoading={isLoading}
        latestSignals={latestSignals}
      />
      
      <RiskMonitoringCard 
        isLoading={isLoading}
        latestSignals={latestSignals}
        latestActions={latestActions}
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};
