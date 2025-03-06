
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InteractiveBrokersTabContent from './broker/InteractiveBrokersTabContent';
import SchwabTabContent from './broker/SchwabTabContent';
import TDAmeritradeTabContent from './broker/TDAmeritradeTabContent';
import NoBrokerTabContent from './broker/NoBrokerTabContent';
import { useDataProvider } from '@/hooks/useDataProvider';

const BrokerSettings: React.FC = () => {
  const { provider, connect, disconnect } = useDataProvider();
  const [isConnecting, setIsConnecting] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState<'connected' | 'error' | 'disconnected'>(
    provider?.isConnected() ? 'connected' : 'disconnected'
  );
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (provider && typeof provider.connect === 'function') {
        const success = await provider.connect();
        setBrokerStatus(success ? 'connected' : 'error');
        return success;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect:', error);
      setBrokerStatus('error');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      if (provider && typeof provider.disconnect === 'function') {
        const success = await provider.disconnect();
        if (success) {
          setBrokerStatus('disconnected');
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error('Failed to disconnect:', error);
      return false;
    }
  };
  
  return (
    <Tabs defaultValue="none" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="ibkr">Interactive Brokers</TabsTrigger>
        <TabsTrigger value="schwab">Charles Schwab</TabsTrigger>
        <TabsTrigger value="td">TD Ameritrade</TabsTrigger>
        <TabsTrigger value="none">No Broker</TabsTrigger>
      </TabsList>
      
      <TabsContent value="ibkr">
        <InteractiveBrokersTabContent 
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
      
      <TabsContent value="td">
        <TDAmeritradeTabContent 
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
