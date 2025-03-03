
import { useState, useEffect } from 'react';
import { DataProviderInterface, DataProviderConfig, DataProviderStatus } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { BrokerSettings } from '@/lib/types/spy/broker';

/**
 * Hook to use a data provider
 */
export const useDataProvider = (brokerSettings: BrokerSettings) => {
  const [provider, setProvider] = useState<DataProviderInterface | null>(null);
  const [status, setStatus] = useState<DataProviderStatus>({
    connected: false,
    lastUpdated: new Date(),
    quotesDelayed: true
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize provider based on broker settings
  useEffect(() => {
    if (brokerSettings.type === 'none') {
      // Use mock provider
      setProvider(getDataProvider());
      return;
    }

    // Get provider config from broker settings
    const config: DataProviderConfig = {
      type: brokerSettings.type,
      apiKey: brokerSettings.credentials.apiKey,
      secretKey: brokerSettings.credentials.secretKey,
      accountId: brokerSettings.credentials.accountId,
      appKey: brokerSettings.credentials.appKey,
      callbackUrl: brokerSettings.credentials.callbackUrl,
      paperTrading: brokerSettings.paperTrading
    };

    // Get provider
    const dataProvider = getDataProvider(config);
    setProvider(dataProvider);

    // Connect if needed
    if (brokerSettings.isConnected && !dataProvider.isConnected()) {
      connectToProvider(dataProvider);
    }
  }, [brokerSettings]);

  // Connect to provider
  const connectToProvider = async (dataProvider: DataProviderInterface) => {
    setIsConnecting(true);
    try {
      const connected = await dataProvider.connect();
      setStatus({
        connected,
        lastUpdated: new Date(),
        quotesDelayed: true
      });
    } catch (error) {
      console.error('Error connecting to data provider:', error);
      setStatus({
        connected: false,
        lastUpdated: new Date(),
        quotesDelayed: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect to provider
  const connect = async () => {
    if (!provider) return false;
    return connectToProvider(provider);
  };

  // Disconnect from provider
  const disconnect = async () => {
    if (!provider) return false;
    
    try {
      const disconnected = await provider.disconnect();
      if (disconnected) {
        setStatus({
          connected: false,
          lastUpdated: new Date(),
          quotesDelayed: true
        });
      }
      return disconnected;
    } catch (error) {
      console.error('Error disconnecting from data provider:', error);
      return false;
    }
  };

  return {
    provider,
    status,
    isConnecting,
    connect,
    disconnect
  };
};
