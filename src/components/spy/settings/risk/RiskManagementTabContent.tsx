
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';
import { BasicRiskSettingsTab } from './tabs/BasicRiskSettingsTab';
import { DynamicRiskMonitoringTab } from './tabs/DynamicRiskMonitoringTab';
import { useRiskMonitoring } from '@/hooks/useRiskMonitoring';

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
  // Use our risk monitoring hook
  const {
    isLoading,
    latestSignals,
    latestActions,
    learningInsights,
    autoMode,
    performRiskMonitoring,
    toggleAutoMode
  } = useRiskMonitoring(settings, currentRiskTolerance);
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="mb-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="basic">Basic Risk Settings</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Risk Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-2">
          <BasicRiskSettingsTab
            settings={settings}
            updateSettings={updateSettings}
            updateNestedSettings={updateNestedSettings}
          />
        </TabsContent>
        
        <TabsContent value="dynamic" className="space-y-4 pt-2">
          <DynamicRiskMonitoringTab
            settings={settings}
            updateSettings={updateSettings}
            isLoading={isLoading}
            latestSignals={latestSignals}
            latestActions={latestActions}
            learningInsights={learningInsights}
            autoMode={autoMode}
            performRiskMonitoring={performRiskMonitoring}
            toggleAutoMode={toggleAutoMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
