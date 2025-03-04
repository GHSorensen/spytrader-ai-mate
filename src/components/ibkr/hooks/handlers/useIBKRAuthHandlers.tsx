
import { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';
import { IBKRAuth } from '@/services/dataProviders/interactiveBrokers/auth';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

interface UseIBKRAuthHandlersProps {
  apiKey: string;
  callbackUrl: string;
  isPaperTrading: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (status: IBKRConnectionStatus) => void;
  setIsConfigured: (value: boolean) => void;
  saveIBKRConfig: (config: DataProviderConfig) => void;
  navigate: NavigateFunction;
}

export const useIBKRAuthHandlers = ({
  apiKey,
  callbackUrl,
  isPaperTrading,
  setIsConnecting,
  setConnectionStatus,
  setIsConfigured,
  saveIBKRConfig,
  navigate
}: UseIBKRAuthHandlersProps) => {
  
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
  
  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  return {
    handleStartAuth,
    handleBackToDashboard
  };
};
