
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';
import { getIBKRConnectionStatus } from '@/services/ibkrService';

interface UseIBKRConnectionMonitoringReturn {
  isMonitoring: boolean;
  lastChecked: Date | null;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  checkConnectionStatus: () => Promise<IBKRConnectionStatus>;
}

export const useIBKRConnectionMonitoring = (
  setConnectionStatus: (status: IBKRConnectionStatus) => void
): UseIBKRConnectionMonitoringReturn => {
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [monitoringInterval, setMonitoringInterval] = useState<number | null>(null);

  const checkConnectionStatus = useCallback(async (): Promise<IBKRConnectionStatus> => {
    try {
      const status = await getIBKRConnectionStatus();
      setConnectionStatus(status);
      setLastChecked(new Date());
      return status;
    } catch (err: any) {
      console.error('Failed to check IBKR connection status:', err);
      toast({
        title: 'Connection Check Failed',
        description: `Failed to check IBKR connection status: ${err.message}`,
        variant: 'destructive',
      });
      return 'error';
    }
  }, [setConnectionStatus, toast]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    // Check immediately
    checkConnectionStatus();
    
    // Set up interval for periodic checks (every 60 seconds)
    const intervalId = window.setInterval(() => {
      checkConnectionStatus();
    }, 60000);
    
    setMonitoringInterval(intervalId);
    setIsMonitoring(true);
    
    console.log('Started IBKR connection monitoring');
  }, [isMonitoring, checkConnectionStatus]);

  const stopMonitoring = useCallback(() => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
    setIsMonitoring(false);
    console.log('Stopped IBKR connection monitoring');
  }, [monitoringInterval]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  return {
    isMonitoring,
    lastChecked,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus,
  };
};
