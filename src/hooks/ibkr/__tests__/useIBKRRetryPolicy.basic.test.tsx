
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';
import { logError } from '@/lib/errorMonitoring';
import { setupRetryPolicyTest, createTestError } from './utils/retryPolicyTestUtils';

describe('useIBKRRetryPolicy Basic Operations', () => {
  setupRetryPolicyTest();

  test('should execute operation successfully on first try', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    
    const { result } = renderHook(() => useIBKRRetryPolicy());
    
    let operationResult;
    await act(async () => {
      operationResult = await result.current.executeWithRetry(mockOperation);
    });
    
    expect(operationResult).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.lastError).toBeNull();
  });

  test('should reset retry state when requested', async () => {
    const error = createTestError('Test error');
    const mockOperation = jest.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries: 1
    }));
    
    await act(async () => {
      try {
        const promise = result.current.executeWithRetry(mockOperation);
        jest.runAllTimers();
        await promise;
      } catch (e) {
        // Expected to throw
      }
    });
    
    expect(result.current.retryCount).toBe(1);
    expect(result.current.lastError).toBe(error);
    
    // Reset the state
    act(() => {
      result.current.resetRetryState();
    });
    
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.lastError).toBeNull();
  });
});
