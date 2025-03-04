
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
    disconnect,
    startMonitoring
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

  // Check connection status and fetch accounts
  useEffect(() => {
    // Start connection monitoring when component mounts
    if (isConfigured) {
      startMonitoring();
    }
    
    // Fetch accounts when connected
    if (connectionStatus === 'connected') {
      fetchAccounts();
    }
    
    return () => {
      // Connection monitoring is cleaned up in the monitoring hook
    };
  }, [isConfigured, connectionStatus, fetchAccounts, startMonitoring]);

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
