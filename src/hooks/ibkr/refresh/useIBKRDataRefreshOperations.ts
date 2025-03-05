
import { useCallback } from 'react';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';
import { useIBKRDataRefresh } from '../useIBKRDataRefresh';

interface RefreshOperationsProps {
  refetchMarketData: () => Promise<any>;
  refetchOptions: () => Promise<any>;
  executeWithRetry: (
    fn: () => Promise<any>,
    context: { component: string; method: string; subMethod?: string }
  ) => Promise<any>;
  setInternalErrors: React.Dispatch<React.SetStateAction<ClassifiedError[]>>;
}

/**
 * Hook that provides data refresh functionality for IBKR data
 */
export const useIBKRDataRefreshOperations = ({
  refetchMarketData,
  refetchOptions,
  executeWithRetry,
  setInternalErrors
}: RefreshOperationsProps) => {
  // Data refresh operations
  const { refreshAllData } = useIBKRDataRefresh(
    refetchMarketData,
    refetchOptions,
    executeWithRetry,
    setInternalErrors
  );

  return {
    refreshAllData
  };
};
