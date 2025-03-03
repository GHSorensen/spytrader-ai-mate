
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';

import { AISettingsTabs } from '../AISettingsTabs';
import { StrategyTab } from '../StrategyTab';
import { RiskManagementTab } from '../RiskManagementTab';
import { MarketConditionsTab } from '../MarketConditionsTab';
import { BacktestingTab } from '../BacktestingTab';
import { AdvancedTab } from '../AdvancedTab';

interface AISettingsContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AITradingSettings;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
  updateNestedSettings: <K extends keyof AITradingSettings, N extends keyof AITradingSettings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => void;
  currentRiskTolerance: RiskToleranceType;
  onRiskToleranceChange: (tolerance: RiskToleranceType) => void;
}

export const AISettingsContent: React.FC<AISettingsContentProps> = ({
  activeTab,
  setActiveTab,
  settings,
  updateSettings,
  updateNestedSettings,
  currentRiskTolerance,
  onRiskToleranceChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 p-6 pt-4 pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <AISettingsTabs activeTab={activeTab} />
          
          <ScrollArea className="pr-4 mt-4 max-h-[calc(90vh-220px)]">
            <TabsContent value="strategy" className="space-y-4 mt-2 pb-4">
              <StrategyTab 
                settings={settings}
                updateSettings={updateSettings}
                currentRiskTolerance={currentRiskTolerance}
                onRiskToleranceChange={onRiskToleranceChange}
              />
            </TabsContent>
            
            <TabsContent value="risk" className="space-y-4 mt-2 pb-4">
              <RiskManagementTab 
                settings={settings}
                updateSettings={updateSettings}
                updateNestedSettings={updateNestedSettings}
              />
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4 mt-2 pb-4">
              <MarketConditionsTab 
                settings={settings}
                setSettings={setSettings}
              />
            </TabsContent>
            
            <TabsContent value="backtest" className="space-y-4 mt-2 pb-4">
              <BacktestingTab 
                settings={settings}
                updateNestedSettings={updateNestedSettings}
              />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 mt-2 pb-4">
              <AdvancedTab 
                settings={settings}
                updateSettings={updateSettings}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};
