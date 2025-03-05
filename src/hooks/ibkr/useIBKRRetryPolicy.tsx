
import { useState, useCallback } from 'react';
import { logError } from '@/lib/errorMonitoring/core/logger';

interface RetryPolicyConfig {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
  retryOnCodes?: number[];
}

interface RetryContext {
  component?: string;
  method?: string;
  subMethod?: string;
  [key: string]: any;
}

/**
 * Hook that implements an exponential backoff retry policy for IBKR API calls
 * Provides a way to execute operations with automatic retries on failure
 */
export const useIBKRRetryPolicy = ({
  maxRetries = 3,
  initialDelay = 500,
  backoffFactor = 2,
  maxDelay = 10000,
  retryOnCodes = [408, 429, 502, 503, 504]
}: RetryPolicyConfig = {}) => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  /**
   * Reset retry state
   */
  const resetRetryState = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  /**
   * Calculate delay for next retry using exponential backoff
   */
  const calculateBackoff = useCallback((attempt: number): number => {
    const delay = Math.min(
      initialDelay * Math.pow(backoffFactor, attempt),
      maxDelay
    );
    // Add some jitter to prevent synchronized retries
    return delay * (0.8 + Math.random() * 0.4);
  }, [initialDelay, backoffFactor, maxDelay]);

  /**
   * Execute operation with retry logic
   */
  const executeWithRetry = useCallback(async <T extends any>(
    operation: () => Promise<T>,
    context: RetryContext = {}
  ): Promise<T> => {
    setIsRetrying(false);
    
    let currentAttempt = 0;
    
    while (currentAttempt <= maxRetries) {
      try {
        // If not first attempt, we're retrying
        if (currentAttempt > 0) {
          setIsRetrying(true);
          setRetryCount(currentAttempt);
          
          // Log retry attempt
          console.log(`IBKR retry attempt ${currentAttempt}/${maxRetries} for ${context.method || 'operation'}`);
        }
        
        const result = await operation();
        
        // If successful after retries, reset retry state
        if (currentAttempt > 0) {
          console.log(`IBKR retry succeeded after ${currentAttempt} attempts`);
          resetRetryState();
        }
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setLastError(err);
        
        // Determine if we should retry based on error or HTTP status code
        const statusCode = (error as any)?.status || (error as any)?.statusCode;
        const shouldRetryOnStatus = statusCode && retryOnCodes.includes(statusCode);
        
        // If we've exhausted retries or error indicates we shouldn't retry
        if (currentAttempt >= maxRetries || (!shouldRetryOnStatus && !(error instanceof TypeError))) {
          // Log the error with context
          logError(err, {
            ...context,
            retryAttempt: currentAttempt,
            maxRetries
          });
          
          console.error(`IBKR operation failed after ${currentAttempt} ${currentAttempt === 1 ? 'retry' : 'retries'}:`, err);
          throw err;
        }
        
        // Calculate and apply backoff delay
        const delay = calculateBackoff(currentAttempt);
        console.log(`IBKR retrying in ${Math.round(delay)}ms (attempt ${currentAttempt + 1}/${maxRetries})`);
        
        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increment attempt counter
        currentAttempt++;
      }
    }
    
    // This should never be reached due to the throw in the last iteration
    // but TypeScript needs a return value
    throw new Error("Retry logic failed in an unexpected way");
  }, [maxRetries, retryOnCodes, calculateBackoff, resetRetryState]);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    lastError,
    resetRetryState
  };
};
