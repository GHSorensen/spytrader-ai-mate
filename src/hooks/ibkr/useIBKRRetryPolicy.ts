
import { useState, useCallback, useEffect } from 'react';
import { logError } from '@/lib/errorMonitoring';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
  retryOnCodes?: number[];
}

/**
 * Hook that provides retry policy functionality for IBKR data requests
 * Implements exponential backoff for failed requests
 */
export const useIBKRRetryPolicy = (config?: RetryConfig) => {
  // Configure retry policy with defaults
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    retryOnCodes = []
  } = config || {};
  
  // Track retry state
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // Reset retry state when configuration changes
  useEffect(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, [maxRetries, initialDelay, backoffFactor, maxDelay]);
  
  // Calculate backoff delay using exponential backoff
  const calculateBackoff = useCallback((attempt: number): number => {
    const delay = Math.min(
      initialDelay * Math.pow(backoffFactor, attempt),
      maxDelay
    );
    
    // Add some jitter to prevent thundering herd problem
    return delay * (0.8 + Math.random() * 0.4);
  }, [initialDelay, backoffFactor, maxDelay]);
  
  // Execute an operation with retry policy
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> => {
    // Reset for new operation
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
    
    let attempts = 0;
    
    while (true) {
      try {
        // Attempt the operation
        const result = await operation();
        
        // On success, reset retry state and return result
        if (attempts > 0) {
          setIsRetrying(false);
          console.log(`Operation succeeded after ${attempts} retries`);
        }
        
        return result;
      } catch (error) {
        attempts++;
        setRetryCount(attempts);
        
        if (error instanceof Error) {
          setLastError(error);
          
          // Log the error with context
          logError(error, {
            ...(context || {}),
            retryAttempt: attempts,
            maxRetries,
          });
        }
        
        // Check if the error has a status code that should be retried
        const errorStatus = (error as any)?.status;
        const shouldRetryStatus = errorStatus && retryOnCodes.includes(errorStatus);
        
        // If we've exceeded max retries, rethrow the error
        if (attempts >= maxRetries || (!shouldRetryStatus && errorStatus)) {
          setIsRetrying(false);
          console.error(`Operation failed after ${attempts} retries`);
          throw error;
        }
        
        // Otherwise, wait for backoff period and retry
        const backoffDelay = calculateBackoff(attempts);
        console.log(`Retrying operation in ${Math.round(backoffDelay)}ms (attempt ${attempts}/${maxRetries})`);
        
        setIsRetrying(true);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }, [maxRetries, calculateBackoff, retryOnCodes]);
  
  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    lastError,
    resetRetryState: useCallback(() => {
      setRetryCount(0);
      setIsRetrying(false);
      setLastError(null);
    }, []),
  };
};
