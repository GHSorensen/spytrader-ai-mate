
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRDataRefresh } from '../useIBKRDataRefresh';
import { logError } from '@/lib/errorMonitoring';

// Mock the error logging
jest.mock('@/lib/errorMonitoring', () => ({
  logError: jest.fn(),
}));

describe('useIBKRDataRefresh', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('refreshAllData should call both refetch functions', async () => {
    const mockRefetchMarketData = jest.fn().mockResolvedValue(true);
    const mockRefetchOptions = jest.fn().mockResolvedValue(true);
    const mockExecuteWithRetry = jest.fn().mockImplementation((fn) => fn());
    const mockSetInternalErrors = jest.fn();
    
    const { result } = renderHook(() => 
      useIBKRDataRefresh(
        mockRefetchMarketData,
        mockRefetchOptions,
        mockExecuteWithRetry,
        mockSetInternalErrors
      )
    );
    
    await act(async () => {
      await result.current.refreshAllData();
    });
    
    expect(mockExecuteWithRetry).toHaveBeenCalledTimes(2);
    expect(mockRefetchMarketData).toHaveBeenCalled();
    expect(mockRefetchOptions).toHaveBeenCalled();
    expect(mockSetInternalErrors).not.toHaveBeenCalled();
  });

  test('refreshAllData should handle errors in market data refetch', async () => {
    const mockError = new Error('Market data refresh failed');
    const mockRefetchMarketData = jest.fn().mockRejectedValue(mockError);
    const mockRefetchOptions = jest.fn().mockResolvedValue(true);
    
    const mockExecuteWithRetry = jest.fn().mockImplementation((fn) => fn());
    const mockSetInternalErrors = jest.fn();
    
    const { result } = renderHook(() => 
      useIBKRDataRefresh(
        mockRefetchMarketData,
        mockRefetchOptions,
        mockExecuteWithRetry,
        mockSetInternalErrors
      )
    );
    
    await act(async () => {
      await result.current.refreshAllData();
    });
    
    expect(mockRefetchMarketData).toHaveBeenCalled();
    expect(mockRefetchOptions).toHaveBeenCalled();
    expect(mockSetInternalErrors).toHaveBeenCalled();
    
    // Verify that one error was added to the internal errors array
    expect(mockSetInternalErrors.mock.calls[0][0]).toBeInstanceOf(Function);
  });

  test('refreshAllData should handle errors in options refetch', async () => {
    const mockError = new Error('Options refresh failed');
    const mockRefetchMarketData = jest.fn().mockResolvedValue(true);
    const mockRefetchOptions = jest.fn().mockRejectedValue(mockError);
    
    const mockExecuteWithRetry = jest.fn().mockImplementation((fn) => fn());
    const mockSetInternalErrors = jest.fn();
    
    const { result } = renderHook(() => 
      useIBKRDataRefresh(
        mockRefetchMarketData,
        mockRefetchOptions,
        mockExecuteWithRetry,
        mockSetInternalErrors
      )
    );
    
    await act(async () => {
      await result.current.refreshAllData();
    });
    
    expect(mockRefetchMarketData).toHaveBeenCalled();
    expect(mockRefetchOptions).toHaveBeenCalled();
    expect(mockSetInternalErrors).toHaveBeenCalled();
    
    // Verify that one error was added to the internal errors array
    expect(mockSetInternalErrors.mock.calls[0][0]).toBeInstanceOf(Function);
  });

  test('refreshAllData should continue with options refresh even if market data refresh fails', async () => {
    const mockMarketError = new Error('Market data refresh failed');
    const mockRefetchMarketData = jest.fn().mockRejectedValue(mockMarketError);
    const mockRefetchOptions = jest.fn().mockResolvedValue(true);
    
    const mockExecuteWithRetry = jest.fn().mockImplementation((fn) => fn());
    const mockSetInternalErrors = jest.fn();
    
    const { result } = renderHook(() => 
      useIBKRDataRefresh(
        mockRefetchMarketData,
        mockRefetchOptions,
        mockExecuteWithRetry,
        mockSetInternalErrors
      )
    );
    
    await act(async () => {
      await result.current.refreshAllData();
    });
    
    expect(mockRefetchMarketData).toHaveBeenCalled();
    expect(mockRefetchOptions).toHaveBeenCalled();
  });
});
