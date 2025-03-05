
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';
import { connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';
import { useIBKRConnectionMonitoring } from './useIBKRConnectionMonitoring';

interface UseIBKRConnectionReturn {
  connectionStatus: IBKRConnectionStatus;
  isConnecting: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setConnectionStatus: (status: IBKRConnectionStatus) => void;
  refreshConnectionStatus: () => Promise<IBKRConnectionStatus>;
  monitoringInfo: {
    isMonitoring: boolean;
    lastChecked: Date | null;
    startMonitoring: () => void;
    stopMonitoring: () => void;
  };
}

export const useIBKRConnection = (): UseIBKRConnectionReturn => {
  const { toast } = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<IBKRConnectionStatus>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the monitoring hook
  const {
    isMonitoring,
    lastChecked,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus: refreshConnectionStatus
  } = useIBKRConnectionMonitoring(setConnectionStatus);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      setError(null);
      
      await connectToIBKR();
      
      setConnectionStatus('connected');
      
      // Start monitoring after connecting
      startMonitoring();
      
      toast({
        title: 'Connected',
        description: 'Successfully connected to Interactive Brokers',
        variant: 'success',
      });
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message || 'Connection failed');
      
      toast({
        title: 'Connection Failed',
        description: err.message || 'Failed to connect to Interactive Brokers',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [startMonitoring, toast]);

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Stop monitoring before disconnecting
      stopMonitoring();
      
      await disconnectFromIBKR();
      
      setConnectionStatus('disconnected');
      
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from Interactive Brokers',
      });
    } catch (err: any) {
      setError(err.message || 'Disconnection failed');
      
      toast({
        title: 'Disconnection Failed',
        description: err.message || 'Failed to disconnect from Interactive Brokers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [stopMonitoring, toast]);

  return {
    connectionStatus,
    isConnecting,
    isLoading,
    error,
    connect,
    disconnect,
    setConnectionStatus,
    refreshConnectionStatus,
    monitoringInfo: {
      isMonitoring,
      lastChecked,
      startMonitoring,
      stopMonitoring
    }
  };
};
