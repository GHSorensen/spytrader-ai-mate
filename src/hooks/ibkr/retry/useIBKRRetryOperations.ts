
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';

/**
 * Hook that provides retry functionality for IBKR operations
 */
export const useIBKRRetryOperations = () => {
  // Setup retry policy for data operations
  const {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    resetRetryState
  } = useIBKRRetryPolicy({
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 1.5,
    retryOnCodes: [429, 503, 504]
  });

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    resetRetryState
  };
};
