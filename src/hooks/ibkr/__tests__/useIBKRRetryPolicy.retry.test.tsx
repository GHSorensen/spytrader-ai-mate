
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';
import { logError } from '@/lib/errorMonitoring';
import { setupRetryPolicyTest, createTestError } from './utils/retryPolicyTestUtils';

describe('useIBKRRetryPolicy Retry Logic', () => {
  setupRetryPolicyTest();

  test('should retry on network errors with proper backoff', async () => {
    const networkError = createTestError('Network error');
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce('success');
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries: 3,
      initialDelay: 100,
      backoffFactor: 2
    }));
    
    let operationResult;
    await act(async () => {
      const promise = result.current.executeWithRetry(mockOperation);
      
      // Fast forward timers after each rejection
      jest.runAllTimers(); // First backoff
      jest.runAllTimers(); // Second backoff
      
      operationResult = await promise;
    });
    
    expect(operationResult).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(3);
    expect(result.current.retryCount).toBe(2);
    expect(result.current.isRetrying).toBe(true);  // Still true until reset
    
    // Reset should clear the state
    act(() => {
      result.current.resetRetryState();
    });
    
    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  test('should respect maxRetries and throw after exhausting retries', async () => {
    const persistentError = createTestError('Persistent error');
    const mockOperation = jest.fn().mockRejectedValue(persistentError);
    
    const maxRetries = 2;
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries,
      initialDelay: 50
    }));
    
    await act(async () => {
      try {
        const promise = result.current.executeWithRetry(mockOperation);
        
        // Fast forward for each retry
        for (let i = 0; i < maxRetries; i++) {
          jest.runAllTimers();
        }
        
        await promise;
        // If the promise doesn't reject, we should fail the test
        expect('This should not be reached').toBe('Promise should have rejected');
      } catch (error) {
        expect(error).toBe(persistentError);
        expect(mockOperation).toHaveBeenCalledTimes(maxRetries + 1); // Initial + retries
        expect(result.current.retryCount).toBe(maxRetries);
        expect(result.current.lastError).toBe(persistentError);
      }
    });
    
    // Verify error was logged
    expect(logError).toHaveBeenCalledWith(persistentError, expect.objectContaining({
      retryAttempt: maxRetries,
      maxRetries: maxRetries
    }));
  });
});
