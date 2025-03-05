
import { useCallback } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';
import { getProviderErrorContext } from '@/services/dataProviders/interactiveBrokers/utils/providerUtils';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

/**
 * Hook for data refresh operations with error handling for IBKR data
 */
export const useIBKRDataRefresh = (
  refetchMarketData: () => Promise<any>,
  refetchOptions: () => Promise<any>,
  executeWithRetry: (
    fn: () => Promise<any>,
    context: { component: string; method: string; subMethod?: string }
  ) => Promise<any>,
  setInternalErrors: React.Dispatch<React.SetStateAction<ClassifiedError[]>>
) => {
  /**
   * Refresh all data from IBKR with retry capability
   * Handles errors gracefully to ensure all data sources are attempted
   * even if one fails
   */
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all IBKR data sources");
    const refreshErrors: ClassifiedError[] = [];
    
    try {
      // Attempt to refresh market data with retry policy
      await executeWithRetry(
        () => refetchMarketData(),
        { 
          component: 'useIBKRRealTimeData', 
          method: 'refreshAllData',
          subMethod: 'refetchMarketData'
        }
      );
    } catch (error) {
      console.error("Error refreshing market data:", error);
      // Classify the error for better handling
      const provider = getDataProvider();
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRRealTimeData',
        method: 'refreshAllData.marketData',
        connectionMethod,
        paperTrading
      });
      refreshErrors.push(classifiedError);
    }
    
    try {
      // Attempt to refresh options data with retry policy
      await executeWithRetry(
        () => refetchOptions(),
        { 
          component: 'useIBKRRealTimeData', 
          method: 'refreshAllData',
          subMethod: 'refetchOptions'
        }
      );
    } catch (error) {
      console.error("Error refreshing options data:", error);
      // Classify the error for better handling
      const provider = getDataProvider();
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRRealTimeData',
        method: 'refreshAllData.options',
        connectionMethod,
        paperTrading
      });
      refreshErrors.push(classifiedError);
    }
    
    if (refreshErrors.length > 0) {
      setInternalErrors(prev => [...prev, ...refreshErrors]);
    }
  }, [refetchMarketData, refetchOptions, executeWithRetry, setInternalErrors]);

  return { refreshAllData };
};
