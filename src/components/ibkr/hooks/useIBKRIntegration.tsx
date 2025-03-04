
import { useEffect } from 'react';
import { useIBKRConnection } from './ibkr-connection/useIBKRConnection';
import { useIBKRAccounts } from './ibkr-accounts/useIBKRAccounts';
import { useIBKRConfig } from './ibkr-config/useIBKRConfig';
import { IBKRAccount, IBKRConnectionStatus } from '@/lib/types/ibkr';

interface IBKRIntegrationHook {
  // Connection state
  connectionStatus: IBKRConnectionStatus;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (value: IBKRConnectionStatus) => void;
  
  // Account data
  accounts: IBKRAccount[];
  isLoading: boolean;
  error: string | null;
  
  // API method
  apiMethod: 'webapi' | 'tws';
  setApiMethod: (value: 'webapi' | 'tws') => void;
  
  // API credentials
  apiKey: string;
  setApiKey: (value: string) => void;
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
  
  // TWS settings
  twsHost: string;
  setTwsHost: (value: string) => void;
  twsPort: string; 
  setTwsPort: (value: string) => void;
  isPaperTrading: boolean;
  setIsPaperTrading: (value: boolean) => void;
  
  // Configuration state
  isConfigured: boolean;
  setIsConfigured: (value: boolean) => void;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useIBKRIntegration = (): IBKRIntegrationHook => {
  const {
    connectionStatus,
    isConnecting,
    setIsConnecting,
    setConnectionStatus,
    isLoading: connectionLoading,
    error: connectionError,
    connect,
    disconnect
  } = useIBKRConnection();
  
  const {
    accounts,
    isLoading: accountsLoading,
    error: accountsError,
    fetchAccounts
  } = useIBKRAccounts();
  
  const {
    apiMethod,
    setApiMethod,
    apiKey,
    setApiKey,
    callbackUrl,
    setCallbackUrl,
    twsHost,
    setTwsHost,
    twsPort,
    setTwsPort,
    isPaperTrading,
    setIsPaperTrading,
    isConfigured,
    setIsConfigured
  } = useIBKRConfig();

  // Determine if we're loading or have an error
  const isLoading = connectionLoading || accountsLoading;
  const error = connectionError || accountsError;

  // Check connection status and fetch accounts periodically
  useEffect(() => {
    // Initial check
    if (connectionStatus === 'connected') {
      fetchAccounts();
    }
    
    const intervalId = setInterval(() => {
      if (connectionStatus === 'connected') {
        fetchAccounts();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [connectionStatus, fetchAccounts]);

  return {
    connectionStatus,
    isConnecting,
    setIsConnecting,
    setConnectionStatus,
    accounts,
    isLoading,
    error,
    apiMethod,
    setApiMethod,
    apiKey,
    setApiKey,
    callbackUrl,
    setCallbackUrl,
    twsHost,
    setTwsHost,
    twsPort,
    setTwsPort,
    isPaperTrading,
    setIsPaperTrading,
    isConfigured,
    setIsConfigured,
    connect,
    disconnect
  };
};
