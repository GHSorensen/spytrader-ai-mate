
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataProvider } from '@/hooks/useDataProvider';
import { InteractiveBrokersTabContent } from './broker/InteractiveBrokersTabContent';
import { TDAmeritradeTabContent } from './broker/TDAmeritradeTabContent';
import { SchwabTabContent } from './broker/SchwabTabContent';
import { NoBrokerTabContent } from './broker/NoBrokerTabContent';

export const BrokerSettings = () => {
  const { provider, isConnected, isLoading, error, connectToProvider, disconnectFromProvider } = useDataProvider();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const brokerStatus = isConnected ? "connected" : error ? "error" : "disconnected";
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectToProvider();
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await disconnectFromProvider();
      return true;
    } catch (error) {
      console.error("Disconnection error:", error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Determine which broker is active based on provider type
  const getActiveBroker = () => {
    if (!provider) return "none";
    if (provider.config?.type === 'interactive-brokers') return "ibkr";
    if (provider.config?.type === 'td-ameritrade') return "tdameritrade";
    if (provider.config?.type === 'schwab') return "schwab";
    return "none";
  };
  
  return (
    <Tabs defaultValue={getActiveBroker()} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="ibkr">Interactive Brokers</TabsTrigger>
        <TabsTrigger value="tdameritrade">TD Ameritrade</TabsTrigger>
        <TabsTrigger value="schwab">Charles Schwab</TabsTrigger>
        <TabsTrigger value="none">No Broker</TabsTrigger>
      </TabsList>
      
      <TabsContent value="ibkr">
        <InteractiveBrokersTabContent 
          isConnecting={isConnecting}
          brokerStatus={brokerStatus}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          dataProvider={provider}
        />
      </TabsContent>
      
      <TabsContent value="tdameritrade">
        <TDAmeritradeTabContent 
          isConnecting={isConnecting}
          brokerStatus={brokerStatus}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </TabsContent>
      
      <TabsContent value="schwab">
        <SchwabTabContent 
          isConnecting={isConnecting}
          brokerStatus={brokerStatus}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </TabsContent>
      
      <TabsContent value="none">
        <NoBrokerTabContent />
      </TabsContent>
    </Tabs>
  );
};

export default BrokerSettings;
