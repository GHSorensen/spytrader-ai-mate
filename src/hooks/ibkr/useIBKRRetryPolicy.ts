import { useState, useCallback, useEffect } from 'react';
import { logError } from '@/lib/errorMonitoring/core/logger';
import { isIBKRErrorRetryable, getIBKRErrorRetryDelay } from '@/services/dataProviders/interactiveBrokers/utils/errorHandler';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';
import { classifyError } from '@/lib/errorMonitoring/utils/errorClassifier';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
  retryOnCodes?: number[];
}

/**
 * Hook that provides retry policy functionality for IBKR data requests
 * Implements exponential backoff for failed requests with enhanced error classification
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
  const [lastError, setLastError] = useState<ClassifiedError | null>(null);
  
  // Reset retry state when configuration changes
  useEffect(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, [maxRetries, initialDelay, backoffFactor, maxDelay]);
  
  // Calculate backoff delay using exponential backoff
  const calculateBackoff = useCallback((attempt: number, error?: ClassifiedError): number => {
    // If we have a classified error, use its specific retry delay
    if (error) {
      return getIBKRErrorRetryDelay(error, attempt);
    }
    
    // Otherwise use standard exponential backoff
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
        
        // Classify the error for better handling
        const classifiedError = classifyError(error);
        setLastError(classifiedError);
        
        // Log the error with context
        logError(classifiedError, {
          ...(context || {}),
          retryAttempt: attempts,
          maxRetries,
        });
        
        // Check if the error has a status code that should be retried
        const errorStatus = classifiedError.status;
        const shouldRetryStatus = errorStatus && retryOnCodes.includes(errorStatus);
        
        // Check if the error is retryable based on classification
        const isRetryable = shouldRetryStatus || isIBKRErrorRetryable(classifiedError);
        
        // If we've exceeded max retries or the error isn't retryable, rethrow the error
        if (attempts >= maxRetries || !isRetryable) {
          setIsRetrying(false);
          console.error(`Operation failed after ${attempts} retries, error not retryable: ${isRetryable}`);
          throw classifiedError;
        }
        
        // Otherwise, wait for backoff period and retry
        const backoffDelay = calculateBackoff(attempts, classifiedError);
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
