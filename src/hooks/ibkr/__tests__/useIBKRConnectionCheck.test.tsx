
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRConnectionCheck } from '../useIBKRConnectionCheck';
import { ClassifiedError } from '@/lib/errorMonitoring/types/errorClassification';

describe('useIBKRConnectionCheck', () => {
  test('should call checkConnection when forceConnectionCheck is called', () => {
    const mockCheckConnection = jest.fn();
    const mockExecuteWithRetry = jest.fn().mockResolvedValue(true);
    const mockSetInternalErrors = jest.fn();
    
    const { result } = renderHook(() => 
      useIBKRConnectionCheck(
        mockCheckConnection,
        mockExecuteWithRetry,
        mockSetInternalErrors
      )
    );
    
    act(() => {
      result.current.forceConnectionCheck();
    });
    
    expect(mockExecuteWithRetry).toHaveBeenCalled();
    expect(mockExecuteWithRetry.mock.calls[0][1]).toEqual({
      component: 'useIBKRRealTimeData',
      method: 'forceConnectionCheck'
    });
  });
  
  test('should handle errors during connection check', async () => {
    const mockCheckConnection = jest.fn();
    const mockError = new Error('Connection failed');
    
    const mockExecuteWithRetry = jest.fn().mockImplementation(() => {
      throw mockError;
    });
    
    const mockSetInternalErrors = jest.fn();
    
    const { result } = renderHook(() => 
      useIBKRConnectionCheck(
        mockCheckConnection,
        mockExecuteWithRetry,
        mockSetInternalErrors
      )
    );
    
    act(() => {
      result.current.forceConnectionCheck();
    });
    
    expect(mockSetInternalErrors).toHaveBeenCalled();
    // Verify that we're adding an error to the internal errors array
    expect(mockSetInternalErrors.mock.calls[0][0]).toBeInstanceOf(Function);
  });
});
