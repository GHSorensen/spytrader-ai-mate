
import { useIBKRStatusCombiner } from '../useIBKRStatusCombiner';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

interface CombinedStatusProps {
  marketDataLoading: boolean;
  optionsLoading: boolean;
  isRetrying: boolean;
  marketDataError: boolean;
  optionsError: boolean;
  internalErrors: ClassifiedError[];
  isMarketDataFetching: boolean;
  isOptionsFetching: boolean;
}

/**
 * Hook that combines different status indicators into unified status states
 */
export const useIBKRCombinedStatus = (props: CombinedStatusProps) => {
  // Status combining
  const { isLoading, isFetching, isError } = useIBKRStatusCombiner(props);

  return {
    isLoading,
    isFetching,
    isError
  };
};
