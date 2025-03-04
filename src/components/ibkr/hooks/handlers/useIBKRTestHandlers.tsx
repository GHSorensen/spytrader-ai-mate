
import { useCallback } from 'react';
import { toast } from 'sonner';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { clearDataProvider, getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

interface UseIBKRTestHandlersProps {
  apiKey: string;
  callbackUrl: string;
  twsHost: string;
  twsPort: string;
  isPaperTrading: boolean;
  setConnectionStatus: (status: IBKRConnectionStatus) => void;
  setIsConfigured: (value: boolean) => void;
}

export const useIBKRTestHandlers = ({
  apiKey,
  callbackUrl,
  twsHost,
  twsPort,
  isPaperTrading,
  setConnectionStatus,
  setIsConfigured
}: UseIBKRTestHandlersProps) => {
  
  const handleTestConnection = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Get saved config or create new one based on current state
      const savedConfig = localStorage.getItem('ibkr-config');
      const config: DataProviderConfig = savedConfig 
        ? JSON.parse(savedConfig) 
        : {
            type: 'interactive-brokers',
            apiKey,
            callbackUrl,
            twsHost,
            twsPort,
            connectionMethod: twsHost && twsPort ? 'tws' : 'webapi',
            paperTrading: isPaperTrading
          };
          
      // Initialize IBKR service
      const ibkrService = new InteractiveBrokersService(config);
      
      // Test connection
      const connected = await ibkrService.connect();
      
      if (connected) {
        setConnectionStatus('connected');
        setIsConfigured(true);
        toast.success('Connection Test Successful', {
          description: 'Successfully connected to Interactive Brokers.',
        });
        
        // Add service to factory for use throughout the app
        clearDataProvider();
        getDataProvider(config);
      } else {
        setConnectionStatus('error');
        toast.error('Connection Test Failed', {
          description: 'Could not connect to Interactive Brokers. Please check your settings.',
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('error');
      toast.error('Connection Test Error', {
        description: error instanceof Error ? error.message : 'Failed to test connection.',
      });
    }
  }, [apiKey, callbackUrl, twsHost, twsPort, isPaperTrading, setConnectionStatus, setIsConfigured]);
  
  return {
    handleTestConnection
  };
};
