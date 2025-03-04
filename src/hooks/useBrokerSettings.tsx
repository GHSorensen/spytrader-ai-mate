
import { useState } from 'react';
import { toast } from "sonner";
import { DataProviderType } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

export function useBrokerSettings() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeBroker, setActiveBroker] = useState<DataProviderType>('mock');
  const [brokerStatus, setBrokerStatus] = useState('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get current data provider
  const dataProvider = getDataProvider();

  const handleConnect = async (brokerType: DataProviderType) => {
    setIsConnecting(true);
    setBrokerStatus('connecting');
    
    try {
      setActiveBroker(brokerType);
      
      // In a real app, we would connect to the broker here
      // For now, just simulate a connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBrokerStatus('connected');
      toast.success(`Successfully connected to ${brokerType}`);
      
      return true;
    } catch (error) {
      console.error(`Error connecting to ${brokerType}:`, error);
      setBrokerStatus('error');
      toast.error(`Failed to connect to ${brokerType}`);
      
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    setBrokerStatus('disconnecting');
    
    try {
      // In a real app, we would disconnect from the broker here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActiveBroker('mock');
      setBrokerStatus('disconnected');
      toast.success("Successfully disconnected");
      
      return true;
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
      
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    activeBroker,
    brokerStatus,
    handleConnect,
    handleDisconnect,
    dataProvider,
    isConnecting
  };
}
