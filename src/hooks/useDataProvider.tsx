
import { useState, useEffect } from 'react';
import { DataProviderConfig, DataProviderInterface, DataProviderType } from '@/lib/types/spy/dataProvider';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';

// Define a custom hook for managing data provider interactions
export function useDataProvider() {
  const [config, setConfig] = useState<DataProviderConfig | null>(null);
  const [provider, setProvider] = useState<DataProviderInterface | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or update provider when config changes
  useEffect(() => {
    if (config) {
      try {
        // Create a provider instance based on the config
        const newProvider = getDataProvider(config);
        setProvider(newProvider);
        
        // Attempt to connect
        connectToProvider(newProvider);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize provider');
        setIsConnected(false);
      }
    }
  }, [config]);

  // Set up provider with specific type and connection details
  const setupProvider = (type: DataProviderType, options: Partial<DataProviderConfig> = {}) => {
    // Handle the interactive-brokers-tws case by mapping to interactive-brokers with connectionMethod: 'tws'
    const finalType = type === 'interactive-brokers-tws' 
      ? 'interactive-brokers' 
      : type;
    
    const newConfig: DataProviderConfig = {
      type: finalType,
      ...options,
      connectionMethod: type === 'interactive-brokers-tws' ? 'tws' : options.connectionMethod
    };
    
    setConfig(newConfig);
    return newConfig;
  };

  // Connect to the provider
  const connectToProvider = async (providerInstance: DataProviderInterface) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await providerInstance.connect();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Could not establish connection to provider');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from the provider
  const disconnectFromProvider = async () => {
    if (!provider) return false;
    
    setIsLoading(true);
    
    try {
      const disconnected = await provider.disconnect();
      setIsConnected(!disconnected);
      return disconnected;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnection error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    provider,
    config,
    isConnected,
    isLoading,
    error,
    setupProvider,
    connectToProvider: () => provider && connectToProvider(provider),
    disconnectFromProvider
  };
}
