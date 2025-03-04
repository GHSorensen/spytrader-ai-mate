
import { useIBKRConfig } from './ibkr-config/useIBKRConfig';
import { useIBKRIntegrationState } from './ibkr-integration/useIBKRIntegrationState';
import { useIBKRMonitoring } from './ibkr-integration/useIBKRMonitoring';
import { useIBKRConnectionActions } from './ibkr-integration/useIBKRConnectionActions';
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
  // Get configuration state from useIBKRConfig
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

  // Get connection state management
  const {
    connectionStatus,
    setConnectionStatus,
    isConnecting,
    setIsConnecting
  } = useIBKRIntegrationState();

  // Set up monitoring and account management
  const {
    accounts,
    accountsLoading,
    accountsError,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus
  } = useIBKRMonitoring(isConfigured, connectionStatus, setConnectionStatus);

  // Set up connection actions
  const {
    connect,
    disconnect
  } = useIBKRConnectionActions(setConnectionStatus, startMonitoring, stopMonitoring);

  // Determine if we're loading or have an error
  const isLoading = accountsLoading;
  const error = accountsError;

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
