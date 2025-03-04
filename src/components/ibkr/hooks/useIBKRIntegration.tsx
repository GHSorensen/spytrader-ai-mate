
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { IBKRAccount, IBKRConnectionStatus } from '@/lib/types/ibkr';
import { getIBKRConnectionStatus, getIBKRAccounts, connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';

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
  apiMethod: 'api' | 'tws';
  setApiMethod: (value: 'api' | 'tws') => void;
  
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
  
  // Navigation
  navigate: (path: string) => void;
}

export const useIBKRIntegration = (): IBKRIntegrationHook => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<IBKRConnectionStatus>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Account data
  const [accounts, setAccounts] = useState<IBKRAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API method
  const [apiMethod, setApiMethod] = useState<'api' | 'tws'>('api');
  
  // API credentials
  const [apiKey, setApiKey] = useState('');
  const [callbackUrl, setCallbackUrl] = useState(window.location.origin + '/auth/ibkr/callback');
  
  // TWS settings
  const [twsHost, setTwsHost] = useState('127.0.0.1');
  const [twsPort, setTwsPort] = useState('7496');
  const [isPaperTrading, setIsPaperTrading] = useState(false);
  
  // Configuration state
  const [isConfigured, setIsConfigured] = useState(false);

  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await getIBKRConnectionStatus();
      setConnectionStatus(status);
      setError(null);
      
      if (status === 'connected') {
        setIsConfigured(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch connection status');
      toast({
        title: 'Error',
        description: `Failed to fetch IBKR connection status: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const accountsData = await getIBKRAccounts();
      setAccounts(accountsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts');
      toast({
        title: 'Error',
        description: `Failed to fetch IBKR accounts: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      setConnectionStatus('connecting');
      await connectToIBKR();
      setConnectionStatus('connected');
      setError(null);
      toast({
        title: 'IBKR Connected',
        description: 'Successfully connected to IBKR',
      });
    } catch (err: any) {
      setConnectionStatus('disconnected');
      setError(err.message || 'Failed to connect to IBKR');
      toast({
        title: 'Error',
        description: `Failed to connect to IBKR: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await disconnectFromIBKR();
      setConnectionStatus('disconnected');
      setAccounts([]);
      setError(null);
      toast({
        title: 'IBKR Disconnected',
        description: 'Successfully disconnected from IBKR',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect from IBKR');
      toast({
        title: 'Error',
        description: `Failed to disconnect from IBKR: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    checkConnectionStatus();
    
    // Only fetch accounts if we're connected
    if (connectionStatus === 'connected') {
      fetchAccounts();
    }
    
    const intervalId = setInterval(() => {
      checkConnectionStatus();
      if (connectionStatus === 'connected') {
        fetchAccounts();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [checkConnectionStatus, fetchAccounts, connectionStatus]);

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ibkr-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        
        if (config.connectionMethod === 'tws') {
          setApiMethod('tws');
          if (config.twsHost) setTwsHost(config.twsHost);
          if (config.twsPort) setTwsPort(config.twsPort);
          if (config.hasOwnProperty('paperTrading')) setIsPaperTrading(config.paperTrading);
        } else {
          setApiMethod('api');
          if (config.apiKey) setApiKey(config.apiKey);
          if (config.callbackUrl) setCallbackUrl(config.callbackUrl);
        }
        
        setIsConfigured(true);
      } catch (e) {
        console.error('Failed to parse saved IBKR config:', e);
      }
    }
  }, []);

  return {
    // Connection state
    connectionStatus,
    isConnecting,
    setIsConnecting,
    setConnectionStatus,
    
    // Account data
    accounts,
    isLoading,
    error,
    
    // API method
    apiMethod,
    setApiMethod,
    
    // API credentials
    apiKey,
    setApiKey,
    callbackUrl,
    setCallbackUrl,
    
    // TWS settings
    twsHost,
    setTwsHost,
    twsPort, 
    setTwsPort,
    isPaperTrading,
    setIsPaperTrading,
    
    // Configuration state
    isConfigured,
    setIsConfigured,
    
    // Actions
    connect,
    disconnect,
    
    // Navigation
    navigate
  };
};
