
import { useCallback } from 'react';
import { getDataProvider } from '@/services/dataProviders/dataProviderFactory';
import { handleIBKRError } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';
import { getProviderErrorContext } from '@/services/dataProviders/interactiveBrokers/utils/providerUtils';
import { ClassifiedError, ErrorType } from '@/lib/errorMonitoring/types/errorClassification';
import { toast } from 'sonner';

export interface ConnectionCheckResult {
  success: boolean;
  error?: ClassifiedError;
  provider?: string;
  connectionMethod?: 'webapi' | 'tws';
  timeToComplete?: number;
}

/**
 * Enhanced hook for IBKR connection checking operations
 * Includes detailed diagnostics and improved retry logic
 */
export const useIBKRConnectionCheck = (
  checkConnection: () => void,
  executeWithRetry: (
    fn: () => Promise<any>,
    context: { component: string; method: string; subMethod?: string }
  ) => Promise<any>,
  setInternalErrors: React.Dispatch<React.SetStateAction<ClassifiedError[]>>
) => {
  /**
   * Force a connection check with IBKR with enhanced retry capability
   * Provides detailed result information and diagnostics
   */
  const forceConnectionCheck = useCallback(async (): Promise<ConnectionCheckResult> => {
    console.log("Forcing IBKR connection check");
    const startTime = Date.now();
    const provider = getDataProvider();
    
    try {
      // Determine provider type and connection method for diagnostics
      const providerType = provider?.constructor.name || 'Unknown';
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      // Log the connection check attempt
      console.log(`[useIBKRConnectionCheck] Starting connection check for ${providerType} (${connectionMethod || 'unknown'})`);
      
      // First try with the executeWithRetry wrapper for better error handling
      const result = await executeWithRetry(
        async () => {
          checkConnection();
          
          // Additional verification step - explicitly check isConnected() if available
          if (provider && typeof provider.isConnected === 'function') {
            const isActuallyConnected = await provider.isConnected();
            console.log(`[useIBKRConnectionCheck] Provider.isConnected() returned: ${isActuallyConnected}`);
            
            if (!isActuallyConnected) {
              // If not connected, try one explicit connect call
              if (typeof provider.connect === 'function') {
                console.log(`[useIBKRConnectionCheck] Not connected, attempting explicit connect()`);
                const connectResult = await provider.connect();
                console.log(`[useIBKRConnectionCheck] Explicit connect() returned: ${connectResult}`);
                
                if (!connectResult) {
                  throw new Error("Failed to connect to IBKR after explicit connect attempt");
                }
              }
            }
          }
          
          return true;
        },
        { 
          component: 'useIBKRConnectionCheck', 
          method: 'forceConnectionCheck'
        }
      );
      
      const timeToComplete = Date.now() - startTime;
      console.log(`[useIBKRConnectionCheck] Connection check completed successfully in ${timeToComplete}ms`);
      
      return {
        success: true,
        provider: providerType,
        connectionMethod,
        timeToComplete
      };
    } catch (error) {
      const timeToComplete = Date.now() - startTime;
      console.error(`[useIBKRConnectionCheck] Error checking connection (${timeToComplete}ms):`, error);
      
      // Get contextual information for better error handling
      const { connectionMethod, paperTrading } = getProviderErrorContext(provider);
      
      // Classify the error for better handling
      const classifiedError = handleIBKRError(error, {
        service: 'useIBKRConnectionCheck',
        method: 'forceConnectionCheck',
        connectionMethod,
        paperTrading,
        checkTimeMs: timeToComplete
      });
      
      // Add to internal errors
      setInternalErrors(prev => [...prev, classifiedError]);
      
      // For specific connection errors, show toast notification
      if (
        classifiedError.errorType === ErrorType.CONNECTION_REFUSED ||
        classifiedError.errorType === ErrorType.NETWORK_ERROR ||
        classifiedError.errorType === ErrorType.AUTH_EXPIRED
      ) {
        toast.error("Connection Error", {
          description: classifiedError.message,
        });
      }
      
      return {
        success: false,
        error: classifiedError,
        provider: provider?.constructor.name,
        connectionMethod,
        timeToComplete
      };
    }
  }, [checkConnection, executeWithRetry, setInternalErrors]);

  return { forceConnectionCheck };
};
