
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';
import { getIBKRConnectionStatus, connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';

interface UseIBKRConnectionReturn {
  connectionStatus: IBKRConnectionStatus;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (value: IBKRConnectionStatus) => void;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useIBKRConnection = (): UseIBKRConnectionReturn => {
  const { toast } = useToast();
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<IBKRConnectionStatus>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    connectionStatus,
    isConnecting,
    setIsConnecting,
    setConnectionStatus,
    isLoading,
    error,
    connect,
    disconnect
  };
};
