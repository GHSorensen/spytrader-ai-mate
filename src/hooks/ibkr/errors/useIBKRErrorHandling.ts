
import { useState } from 'react';
import { useIBKRErrorHandler } from '../useIBKRErrorHandler';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

/**
 * Hook that provides error handling functionality for IBKR operations
 */
export const useIBKRErrorHandling = () => {
  // Error handling
  const { internalErrors, setInternalErrors, getActiveError } = useIBKRErrorHandler();

  return {
    internalErrors,
    setInternalErrors,
    getActiveError
  };
};
