
import { useState, useCallback } from 'react';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

/**
 * Hook to handle and track IBKR-specific errors
 */
export const useIBKRErrorHandler = () => {
  // Track any internal errors in state
  const [internalErrors, setInternalErrors] = useState<ClassifiedError[]>([]);

  /**
   * Get the most relevant error to display
   */
  const getActiveError = useCallback((
    lastError: ClassifiedError | null,
    marketDataErrorDetails: any,
    optionsErrorDetails: any
  ): ClassifiedError | null => {
    if (lastError) return lastError;
    if (marketDataErrorDetails) return marketDataErrorDetails as ClassifiedError;
    if (optionsErrorDetails) return optionsErrorDetails as ClassifiedError;
    if (internalErrors.length > 0) return internalErrors[internalErrors.length - 1];
    return null;
  }, [internalErrors]);

  return {
    internalErrors,
    setInternalErrors,
    getActiveError
  };
};
