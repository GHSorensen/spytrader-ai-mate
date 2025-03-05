
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';
import { setupRetryPolicyTest, createTestError } from './utils/retryPolicyTestUtils';

describe('useIBKRRetryPolicy Backoff Calculation', () => {
  setupRetryPolicyTest();

  test('should calculate correct backoff delays', async () => {
    const error = createTestError('Test error');
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');
    
    // Spy on setTimeout to check the delay values
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    const initialDelay = 100;
    const backoffFactor = 2;
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries: 3,
      initialDelay,
      backoffFactor
    }));
    
    await act(async () => {
      const promise = result.current.executeWithRetry(mockOperation);
      
      // Fast forward three times for each retry
      jest.runAllTimers();
      jest.runAllTimers();
      jest.runAllTimers();
      
      await promise;
    });
    
    // Check that setTimeout was called with appropriate delays (accounting for jitter)
    const calls = setTimeoutSpy.mock.calls;
    
    // First retry should use delay close to initialDelay
    expect(calls[0][1]).toBeGreaterThanOrEqual(initialDelay * 0.8);
    expect(calls[0][1]).toBeLessThanOrEqual(initialDelay * 1.2);
    
    // Second retry should use delay close to initialDelay * backoffFactor
    expect(calls[1][1]).toBeGreaterThanOrEqual(initialDelay * backoffFactor * 0.8);
    expect(calls[1][1]).toBeLessThanOrEqual(initialDelay * backoffFactor * 1.2);
    
    // Third retry should use delay close to initialDelay * backoffFactor^2
    expect(calls[2][1]).toBeGreaterThanOrEqual(initialDelay * Math.pow(backoffFactor, 2) * 0.8);
    expect(calls[2][1]).toBeLessThanOrEqual(initialDelay * Math.pow(backoffFactor, 2) * 1.2);
  });
});
