
import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';
import { clearDataProvider, getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

interface UseIBKRTwsHandlersProps {
  twsHost: string;
  twsPort: string;
  isPaperTrading: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (status: IBKRConnectionStatus) => void;
  setIsConfigured: (value: boolean) => void;
  saveIBKRConfig: (config: DataProviderConfig) => void;
  navigate: NavigateFunction;
}

export const useIBKRTwsHandlers = ({
  twsHost,
  twsPort,
  isPaperTrading,
  setIsConnecting,
  setConnectionStatus,
  setIsConfigured,
  saveIBKRConfig,
  navigate
}: UseIBKRTwsHandlersProps) => {
  
  const handleTwsConnect = useCallback(async () => {
    try {
      if (!twsHost) {
        toast.error('TWS Host Required', {
          description: 'Please enter your TWS host (usually localhost or 127.0.0.1).',
        });
        return;
      }
      
      if (!twsPort) {
        toast.error('TWS Port Required', {
          description: 'Please enter your TWS port (usually 7496 for live or 7497 for paper).',
        });
        return;
      }
      
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      // Save configuration
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        twsHost,
        twsPort,
        connectionMethod: 'tws',
        paperTrading: isPaperTrading
      };
      
      // Save config
      saveIBKRConfig(config);
      
      // Initialize IBKR service
      const ibkrService = new InteractiveBrokersService(config);
      
      // Test connection
      const connected = await ibkrService.connect();
      
      if (connected) {
        setConnectionStatus('connected');
        setIsConfigured(true);
        toast.success('Connected to TWS', {
          description: 'Successfully connected to Interactive Brokers TWS.',
        });
        
        // Add service to factory
        clearDataProvider();
        getDataProvider(config);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setConnectionStatus('error');
        toast.error('Connection Failed', {
          description: 'Could not connect to TWS. Please check that TWS is running and API connections are enabled.',
        });
      }
    } catch (error) {
      console.error('Error connecting to TWS:', error);
      setConnectionStatus('error');
      toast.error('Connection Error', {
        description: error instanceof Error ? error.message : 'Failed to connect to TWS.',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [twsHost, twsPort, isPaperTrading, setIsConnecting, setConnectionStatus, setIsConfigured, saveIBKRConfig, navigate]);
  
  return {
    handleTwsConnect
  };
};
