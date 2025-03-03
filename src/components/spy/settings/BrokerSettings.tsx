
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Server, X } from "lucide-react";
import { BrokerSettings as BrokerSettingsType } from '@/lib/types/spy/broker';
import { toast } from '@/components/ui/use-toast';
import { useBrokerSettings } from '@/hooks/useBrokerSettings';
import { InteractiveBrokersTabContent } from './broker/InteractiveBrokersTabContent';
import { TDAmeritradeTabContent } from './broker/TDAmeritradeTabContent';
import { NoBrokerTabContent } from './broker/NoBrokerTabContent';

interface BrokerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: BrokerSettingsType;
  onSave: (settings: BrokerSettingsType) => void;
}

export const BrokerSettings: React.FC<BrokerSettingsProps> = ({
  open,
  onOpenChange,
  currentSettings,
  onSave
}) => {
  const {
    settings,
    activeTab,
    setActiveTab,
    status,
    isConnecting,
    updateCredential,
    togglePaperTrading,
    testConnection,
    prepareSettingsForSave
  } = useBrokerSettings({ currentSettings });

  const handleSave = () => {
    const updatedSettings = prepareSettingsForSave();
    onSave(updatedSettings);
    onOpenChange(false);
    
    toast({
      title: "Broker Settings Saved",
      description: `Settings saved for ${
        updatedSettings.type === 'interactive-brokers' ? 'Interactive Brokers' : 
        updatedSettings.type === 'td-ameritrade' ? 'TD Ameritrade' : 'No Broker'
      }`,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Broker Connection Settings
          </DialogTitle>
          <DialogDescription>
            Connect your brokerage account to execute trades automatically
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ib' | 'td' | 'none')}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="ib">Interactive Brokers</TabsTrigger>
            <TabsTrigger value="td">TD Ameritrade</TabsTrigger>
            <TabsTrigger value="none">No Broker</TabsTrigger>
          </TabsList>

          <TabsContent value="ib">
            <InteractiveBrokersTabContent 
              settings={settings}
              updateCredential={updateCredential}
              togglePaperTrading={togglePaperTrading}
              testConnection={testConnection}
              isConnecting={isConnecting}
              status={status}
            />
          </TabsContent>

          <TabsContent value="td">
            <TDAmeritradeTabContent 
              settings={settings}
              updateCredential={updateCredential}
              togglePaperTrading={togglePaperTrading}
              testConnection={testConnection}
              isConnecting={isConnecting}
              status={status}
            />
          </TabsContent>

          <TabsContent value="none">
            <NoBrokerTabContent />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
