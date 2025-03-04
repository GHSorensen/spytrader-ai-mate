
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrokerSettings } from '@/hooks/useBrokerSettings';
import { DataProviderType } from '@/lib/types/spy/dataProvider';
import NoBrokerTabContent from './broker/NoBrokerTabContent';
import TDAmeritradeTabContent from './broker/TDAmeritradeTabContent';
import SchwabTabContent from './broker/SchwabTabContent';
import InteractiveBrokersTabContent from './broker/InteractiveBrokersTabContent';

interface BrokerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BrokerSettings: React.FC<BrokerSettingsProps> = ({
  open,
  onOpenChange
}) => {
  const brokerHook = useBrokerSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <Tabs defaultValue="interactive-brokers" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="td-ameritrade">TD Ameritrade</TabsTrigger>
            <TabsTrigger value="schwab">Schwab</TabsTrigger>
            <TabsTrigger value="interactive-brokers">Interactive Brokers</TabsTrigger>
            <TabsTrigger value="none">None</TabsTrigger>
          </TabsList>
          
          <TabsContent value="td-ameritrade">
            <TDAmeritradeTabContent 
              isConnecting={brokerHook.isConnecting}
              brokerStatus={brokerHook.brokerStatus}
              onConnect={() => brokerHook.handleConnect('td-ameritrade')}
              onDisconnect={brokerHook.handleDisconnect}
            />
          </TabsContent>
          
          <TabsContent value="schwab">
            <SchwabTabContent 
              isConnecting={brokerHook.isConnecting}
              brokerStatus={brokerHook.brokerStatus}
              onConnect={() => brokerHook.handleConnect('schwab')}
              onDisconnect={brokerHook.handleDisconnect}
            />
          </TabsContent>
          
          <TabsContent value="interactive-brokers">
            <InteractiveBrokersTabContent 
              isConnecting={brokerHook.isConnecting}
              brokerStatus={brokerHook.brokerStatus}
              onConnect={() => brokerHook.handleConnect('interactive-brokers')}
              onDisconnect={brokerHook.handleDisconnect}
              dataProvider={brokerHook.dataProvider}
            />
          </TabsContent>
          
          <TabsContent value="none">
            <NoBrokerTabContent />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerSettings;
