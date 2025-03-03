
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from '@/components/ui/use-toast';
import { AISettingsDialogProps, DEFAULT_SETTINGS } from './settings/AISettingsTypes';

// Import our components
import { AISettingsHeader } from './settings/AISettingsHeader';
import { AISettingsFooter } from './settings/AISettingsFooter';
import { AISettingsTabs } from './settings/AISettingsTabs';

// Import the tab components
import { StrategyTab } from './settings/StrategyTab';
import { RiskManagementTab } from './settings/RiskManagementTab';
import { MarketConditionsTab } from './settings/MarketConditionsTab';
import { BacktestingTab } from './settings/BacktestingTab';
import { AdvancedTab } from './settings/AdvancedTab';

export const AISettingsDialog = ({
  open,
  onOpenChange,
  currentRiskTolerance,
  onRiskToleranceChange,
}: AISettingsDialogProps) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('strategy');
  
  const updateSettings = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSettings = <K extends keyof typeof settings, N extends keyof typeof settings[K]>(
    parentKey: K,
    childKey: N,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as object),
        [childKey]: value,
      },
    }));
  };
  
  const handleSaveSettings = () => {
    // Here you would save the settings to your backend or local storage
    toast({
      title: "AI Settings Saved",
      description: "Your trading preferences have been updated",
    });
    onOpenChange(false);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
      variant: "default",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <AISettingsHeader activeTab={activeTab} />
        </div>
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Tab content */}
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
        
        <div className="p-6 pt-0">
          <AISettingsFooter 
            onCancel={() => onOpenChange(false)}
            onSave={handleSaveSettings}
            onReset={handleResetSettings}
            activeTab={activeTab}
            onPrevious={() => {
              const tabs = ['strategy', 'risk', 'market', 'backtest', 'advanced'];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1]);
              }
            }}
            onNext={() => {
              const tabs = ['strategy', 'risk', 'market', 'backtest', 'advanced'];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1]);
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
