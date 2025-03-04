
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { clearDataProvider, getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { InteractiveBrokersService } from '@/services/dataProviders/interactiveBrokersService';

interface UseIBKRHandlersProps {
  apiKey: string;
  callbackUrl: string;
  twsHost: string;
  twsPort: string;
  isPaperTrading: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (status: IBKRConnectionStatus) => void;
  setIsConfigured: (value: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export const useIBKRHandlers = ({
  apiKey,
  callbackUrl,
  twsHost,
  twsPort,
  isPaperTrading,
  setIsConnecting,
  setConnectionStatus,
  setIsConfigured,
  navigate
}: UseIBKRHandlersProps) => {
  
  const saveIBKRConfig = useCallback((config: DataProviderConfig) => {
    localStorage.setItem('ibkr-config', JSON.stringify(config));
    // Clear existing provider to force recreation with new config
    clearDataProvider();
  }, []);
  
  const handleStartAuth = useCallback(async () => {
    try {
      if (!apiKey) {
        toast.error('API Key Required', {
          description: 'Please enter your Interactive Brokers API key.',
        });
        return;
      }
      
      if (!callbackUrl) {
        toast.error('Callback URL Required', {
          description: 'Please enter a callback URL for OAuth redirection.',
        });
        return;
      }
      
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      // Save configuration
      const config: DataProviderConfig = {
        type: 'interactive-brokers',
        apiKey,
        callbackUrl,
        connectionMethod: 'webapi',
        paperTrading: isPaperTrading
      };
      
      // Save to localStorage for the callback page
      saveIBKRConfig(config);
      
      // Generate auth URL
      const ibkrAuth = new IBKRAuth(config);
      const authUrl = ibkrAuth.getAuthorizationUrl();
      
      // Redirect to auth URL
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error starting authentication:', error);
      setConnectionStatus('error');
      toast.error('Authentication Error', {
        description: error instanceof Error ? error.message : 'Failed to start authentication process.',
      });
      setIsConnecting(false);
    }
  }, [apiKey, callbackUrl, isPaperTrading, setIsConnecting, setConnectionStatus, saveIBKRConfig]);
  
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
  
  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  return {
    handleStartAuth,
    handleTwsConnect,
    handleBackToDashboard,
    handleTestConnection
  };
};
