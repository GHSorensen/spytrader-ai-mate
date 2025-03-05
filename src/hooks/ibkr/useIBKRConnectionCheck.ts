
import { useCallback } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';
import { getProviderErrorContext } from '@/services/dataProviders/interactiveBrokers/utils/providerUtils';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

/**
 * Hook for IBKR connection checking operations
 */
export const useIBKRConnectionCheck = (
  checkConnection: () => void,
  executeWithRetry: (
    fn: () => Promise<any>,
    context: { component: string; method: string }
  ) => Promise<any>,
  setInternalErrors: React.Dispatch<React.SetStateAction<ClassifiedError[]>>
) => {
  /**
   * Force a connection check with IBKR with retry capability
   * Useful when connection status might be stale
   */
  const forceConnectionCheck = useCallback(() => {
    console.log("Forcing IBKR connection check");
    try {
      executeWithRetry(
        async () => {
          checkConnection();
          return true;
        },
        { 
          component: 'useIBKRRealTimeData', 
          method: 'forceConnectionCheck'
        }
      );
    } catch (error) {
      console.error("Error checking connection:", error);
      // Classify the error for better handling
      const provider = getDataProvider();
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRRealTimeData',
        method: 'forceConnectionCheck',
        connectionMethod,
        paperTrading
      });
      setInternalErrors(prev => [...prev, classifiedError]);
    }
  }, [checkConnection, executeWithRetry, setInternalErrors]);

  return { forceConnectionCheck };
};
