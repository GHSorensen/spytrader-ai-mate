
import { useEffect } from 'react';
import { useIBKRConnectionMonitoring } from '../ibkr-connection/useIBKRConnectionMonitoring';
import { useIBKRAccounts } from '../ibkr-accounts/useIBKRAccounts';
import { IBKRConnectionStatus } from '@/lib/types/ibkr';

/**
 * Hook to handle IBKR connection monitoring and account fetching
 */
export const useIBKRMonitoring = (
  isConfigured: boolean,
  connectionStatus: IBKRConnectionStatus,
  setConnectionStatus: (status: IBKRConnectionStatus) => void
) => {
  const {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus
  } = useIBKRConnectionMonitoring(setConnectionStatus);
  
  const {
    accounts,
    isLoading: accountsLoading,
    error: accountsError,
    fetchAccounts
  } = useIBKRAccounts();

  // Start connection monitoring when configured
  useEffect(() => {
    if (isConfigured) {
      startMonitoring();
    }
    
    return () => {
      // Connection monitoring is cleaned up in the monitoring hook
    };
  }, [isConfigured, startMonitoring]);
  
  // Fetch accounts when connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchAccounts();
    }
  }, [connectionStatus, fetchAccounts]);

  return {
    accounts,
    accountsLoading,
    accountsError,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkConnectionStatus
  };
};
