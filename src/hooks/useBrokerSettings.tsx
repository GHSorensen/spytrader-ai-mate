
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDataProvider } from './useDataProvider';
import { DataProviderType } from '@/lib/types/spy/dataProvider';

export function useBrokerSettings() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeBroker, setActiveBroker] = useState<DataProviderType | null>(null);
  const dataProvider = useDataProvider();
  
  useEffect(() => {
    if (dataProvider.config?.type) {
      setActiveBroker(dataProvider.config.type);
    }
  }, [dataProvider.config]);

  // Fix: Remove references to non-existent properties
  const getBrokerStatus = () => {
    if (dataProvider.isLoading) return 'loading';
    if (dataProvider.error) return 'error';
    if (dataProvider.isConnected) return 'connected';
    return 'disconnected';
  };

  const handleConnect = async (brokerType: DataProviderType) => {
    try {
      await dataProvider.setupProvider(brokerType);
      await dataProvider.connectToProvider();
      setActiveBroker(brokerType);
      toast.success(`Connected to ${brokerType} successfully`);
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error(`Failed to connect to ${brokerType}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await dataProvider.disconnectFromProvider();
      setActiveBroker(null);
      toast.success('Disconnected from broker');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect from broker');
    }
  };

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    activeBroker,
    brokerStatus: getBrokerStatus(),
    handleConnect,
    handleDisconnect,
    dataProvider
  };
}
