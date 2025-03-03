
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiskToleranceType } from '@/lib/types/spyOptions';
import { toast } from '@/components/ui/use-toast';
import { AISettingsDialogProps, DEFAULT_SETTINGS } from './settings/AISettingsTypes';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI Trading Settings</DialogTitle>
          <DialogDescription>
            Configure how the AI agent manages your SPY options trades.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="pr-4 max-h-[calc(90vh-180px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="risk">Risk Management</TabsTrigger>
              <TabsTrigger value="market">Market Conditions</TabsTrigger>
              <TabsTrigger value="backtest">Backtesting</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strategy" className="space-y-4 mt-4">
              <StrategyTab 
                settings={settings}
                updateSettings={updateSettings}
                currentRiskTolerance={currentRiskTolerance}
                onRiskToleranceChange={onRiskToleranceChange}
              />
            </TabsContent>
            
            <TabsContent value="risk" className="space-y-4 mt-4">
              <RiskManagementTab 
                settings={settings}
                updateSettings={updateSettings}
                updateNestedSettings={updateNestedSettings}
              />
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4 mt-4">
              <MarketConditionsTab 
                settings={settings}
                setSettings={setSettings}
              />
            </TabsContent>
            
            <TabsContent value="backtest" className="space-y-4 mt-4">
              <BacktestingTab 
                settings={settings}
                updateNestedSettings={updateNestedSettings}
              />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <AdvancedTab 
                settings={settings}
                updateSettings={updateSettings}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
