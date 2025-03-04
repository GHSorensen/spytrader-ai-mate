
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';
import { connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';
import { useIBKRConnectionMonitoring } from './useIBKRConnectionMonitoring';

interface UseIBKRConnectionReturn {
  connectionStatus: IBKRConnectionStatus;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  setConnectionStatus: (value: IBKRConnectionStatus) => void;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  checkConnectionStatus: () => Promise<IBKRConnectionStatus>;
}

export const useIBKRConnection = (): UseIBKRConnectionReturn => {
  const { toast } = useToast();
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<IBKRConnectionStatus>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isMonitoring,
    lastChecked,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus
  } = useIBKRConnectionMonitoring(setConnectionStatus);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      setConnectionStatus('connecting');
      await connectToIBKR();
      setConnectionStatus('connected');
      setError(null);
      
      // Start monitoring once connected
      startMonitoring();
      
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
  }, [toast, startMonitoring]);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      // Stop monitoring before disconnecting
      stopMonitoring();
      
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
  }, [toast, stopMonitoring]);

  return {
    connectionStatus,
    isConnecting,
    setIsConnecting,
    setConnectionStatus,
    isLoading,
    error,
    connect,
    disconnect,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus
  };
};
