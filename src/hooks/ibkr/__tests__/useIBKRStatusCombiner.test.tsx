
import { renderHook } from '@testing-library/react-hooks';
import { useIBKRStatusCombiner } from '../useIBKRStatusCombiner';

describe('useIBKRStatusCombiner', () => {
  test('should combine loading states properly', () => {
    const { result } = renderHook(() => 
      useIBKRStatusCombiner({
        marketDataLoading: true,
        optionsLoading: false,
        isRetrying: false,
        marketDataError: false,
        optionsError: false,
        internalErrors: [],
        isMarketDataFetching: false,
        isOptionsFetching: false
      })
    );
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  test('should combine error states properly', () => {
    const { result } = renderHook(() => 
      useIBKRStatusCombiner({
        marketDataLoading: false,
        optionsLoading: false,
        isRetrying: false,
        marketDataError: true,
        optionsError: false,
        internalErrors: [],
        isMarketDataFetching: false,
        isOptionsFetching: false
      })
    );
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.isFetching).toBe(false);
  });

  test('should handle retrying state properly', () => {
    const { result } = renderHook(() => 
      useIBKRStatusCombiner({
        marketDataLoading: false,
        optionsLoading: false,
        isRetrying: true,
        marketDataError: false,
        optionsError: false,
        internalErrors: [],
        isMarketDataFetching: false,
        isOptionsFetching: false
      })
    );
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isFetching).toBe(true);
  });

  test('should handle internal errors correctly', () => {
    const { result } = renderHook(() => 
      useIBKRStatusCombiner({
        marketDataLoading: false,
        optionsLoading: false,
        isRetrying: false,
        marketDataError: false,
        optionsError: false,
        internalErrors: [{ code: 'TEST_ERROR', message: 'Test error' }],
        isMarketDataFetching: false,
        isOptionsFetching: false
      })
    );
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.isFetching).toBe(false);
  });

  test('should combine fetching states properly', () => {
    const { result } = renderHook(() => 
      useIBKRStatusCombiner({
        marketDataLoading: false,
        optionsLoading: false,
        isRetrying: false,
        marketDataError: false,
        optionsError: false,
        internalErrors: [],
        isMarketDataFetching: true,
        isOptionsFetching: false
      })
    );
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isFetching).toBe(true);
  });
});
