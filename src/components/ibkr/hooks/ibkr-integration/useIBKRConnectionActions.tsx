
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { connectToIBKR, disconnectFromIBKR } from '@/services/ibkrService';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

/**
 * Hook to provide IBKR connection actions
 */
export const useIBKRConnectionActions = (
  setConnectionStatus: (status: IBKRConnectionStatus) => void,
  startMonitoring: () => void,
  stopMonitoring: () => void
) => {
  const { toast } = useToast();
  
  const connect = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      await connectToIBKR();
      setConnectionStatus('connected');
      
      // Start monitoring once connected
      startMonitoring();
      
      toast({
        title: 'IBKR Connected',
        description: 'Successfully connected to IBKR',
      });
    } catch (err: any) {
      setConnectionStatus('disconnected');
      toast({
        title: 'Error',
        description: `Failed to connect to IBKR: ${err.message}`,
        variant: 'destructive',
      });
    }
  }, [toast, startMonitoring, setConnectionStatus]);

  const disconnect = useCallback(async () => {
    try {
      // Stop monitoring before disconnecting
      stopMonitoring();
      
      await disconnectFromIBKR();
      setConnectionStatus('disconnected');
      toast({
        title: 'IBKR Disconnected',
        description: 'Successfully disconnected from IBKR',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to disconnect from IBKR: ${err.message}`,
        variant: 'destructive',
      });
    }
  }, [toast, stopMonitoring, setConnectionStatus]);

  return {
    connect,
    disconnect
  };
};
