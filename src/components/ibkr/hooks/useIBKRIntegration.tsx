// src/components/ibkr/hooks/useIBKRIntegration.tsx
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IBKRAccount, IBKRConnectionStatus } from '@/lib/types/ibkr';
import { getIBKRConnectionStatus, getIBKRAccounts, connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';

interface IBKRIntegrationHook {
  connectionStatus: IBKRConnectionStatus;
  accounts: IBKRAccount[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useIBKRIntegration = (): IBKRIntegrationHook => {
  const [connectionStatus, setConnectionStatus] = useState<IBKRConnectionStatus>('disconnected');
  const [accounts, setAccounts] = useState<IBKRAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await getIBKRConnectionStatus();
      setConnectionStatus(status);
      setError(null);
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
    fetchAccounts();

    const intervalId = setInterval(() => {
      checkConnectionStatus();
      fetchAccounts();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [checkConnectionStatus, fetchAccounts]);

  useEffect(() => {
    if (connectionStatus === "connecting" || connectionStatus === "disconnected") {
        setIsLoading(true);
    } else {
        setIsLoading(false);
    }
  }, [connectionStatus]);

  return {
    connectionStatus,
    accounts,
    connect,
    disconnect,
    isLoading,
    error,
  };
};
