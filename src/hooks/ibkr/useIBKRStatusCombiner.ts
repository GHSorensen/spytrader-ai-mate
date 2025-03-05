
import { useMemo } from 'react';

/**
 * Hook to combine various status indicators from IBKR data
 */
export const useIBKRStatusCombiner = ({
  marketDataLoading,
  optionsLoading,
  isRetrying,
  marketDataError,
  optionsError,
  internalErrors,
  isMarketDataFetching,
  isOptionsFetching
}: {
  marketDataLoading: boolean;
  optionsLoading: boolean;
  isRetrying: boolean;
  marketDataError: boolean;
  optionsError: boolean;
  internalErrors: any[];
  isMarketDataFetching: boolean;
  isOptionsFetching: boolean;
}) => {
  // Combine loading states
  const isLoading = useMemo(() => 
    marketDataLoading || optionsLoading || isRetrying,
    [marketDataLoading, optionsLoading, isRetrying]
  );
  
  // Combine fetching states
  const isFetching = useMemo(() => 
    isMarketDataFetching || isOptionsFetching || isRetrying,
    [isMarketDataFetching, isOptionsFetching, isRetrying]
  );

  // Combine error states
  const isError = useMemo(() => 
    marketDataError || optionsError || internalErrors.length > 0,
    [marketDataError, optionsError, internalErrors.length]
  );

  return {
    isLoading,
    isFetching,
    isError
  };
};
