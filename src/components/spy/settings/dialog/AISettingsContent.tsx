
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AITradingSettings, RiskToleranceType } from '@/lib/types/spy';

import { AISettingsTabs } from '../AISettingsTabs';
import { StrategyTabContent } from './tabs/StrategyTabContent';
import { RiskManagementTabContent } from './tabs/RiskManagementTabContent';
import { MarketConditionsTabContent } from './tabs/MarketConditionsTabContent';
import { BacktestingTabContent } from './tabs/BacktestingTabContent';
import { AdvancedTabContent } from './tabs/AdvancedTabContent';

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
          
          <div className="mt-4">
            <ScrollArea className="h-[calc(70vh-180px)] pr-4 pb-4">
              <TabsContent value="strategy" className="space-y-4 mt-2 pb-6 data-[state=active]:block">
                <StrategyTabContent 
                  settings={settings}
                  updateSettings={updateSettings}
                  currentRiskTolerance={currentRiskTolerance}
                  onRiskToleranceChange={onRiskToleranceChange}
                />
              </TabsContent>
              
              <TabsContent value="risk" className="space-y-4 mt-2 pb-6 data-[state=active]:block">
                <RiskManagementTabContent 
                  settings={settings}
                  updateSettings={updateSettings}
                  updateNestedSettings={updateNestedSettings}
                  currentRiskTolerance={currentRiskTolerance}
                />
              </TabsContent>
              
              <TabsContent value="market" className="space-y-4 mt-2 pb-6 data-[state=active]:block">
                <MarketConditionsTabContent 
                  settings={settings}
                  updateSettings={updateSettings}
                  currentRiskTolerance={currentRiskTolerance}
                />
              </TabsContent>
              
              <TabsContent value="backtest" className="space-y-4 mt-2 pb-6 data-[state=active]:block">
                <BacktestingTabContent 
                  settings={settings}
                  updateNestedSettings={updateNestedSettings}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 mt-2 pb-6 data-[state=active]:block">
                <AdvancedTabContent 
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
