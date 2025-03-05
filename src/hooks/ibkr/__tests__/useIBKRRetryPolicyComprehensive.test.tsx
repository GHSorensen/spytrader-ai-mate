
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';
import { logError } from '@/lib/errorMonitoring/core/logger';

// Mock the error logging
jest.mock('@/lib/errorMonitoring/core/logger', () => ({
  logError: jest.fn(),
}));

describe('useIBKRRetryPolicy Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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

  test('should retry on network errors with proper backoff', async () => {
    const networkError = new TypeError('Network error');
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

  test('should retry on specific HTTP status codes', async () => {
    const rateLimitError = { status: 429, message: 'Rate limited' };
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce('success');
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      retryOnCodes: [429, 503]
    }));
    
    let operationResult;
    await act(async () => {
      const promise = result.current.executeWithRetry(mockOperation);
      jest.runAllTimers();
      operationResult = await promise;
    });
    
    expect(operationResult).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  test('should respect maxRetries and throw after exhausting retries', async () => {
    const persistentError = new Error('Persistent error');
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
        fail('Should have thrown an error');
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

  test('should not retry on non-retriable errors', async () => {
    const nonRetriableError = new Error('Bad Request');
    nonRetriableError['status'] = 400; // HTTP 400 is typically not retriable
    
    const mockOperation = jest.fn().mockRejectedValue(nonRetriableError);
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      retryOnCodes: [429, 503, 504]
    }));
    
    await act(async () => {
      try {
        await result.current.executeWithRetry(mockOperation);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(nonRetriableError);
        expect(mockOperation).toHaveBeenCalledTimes(1); // No retries
      }
    });
  });

  test('should include context in error logs', async () => {
    const error = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(error);
    const context = { component: 'TestComponent', method: 'testMethod', userId: '12345' };
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries: 1
    }));
    
    await act(async () => {
      try {
        const promise = result.current.executeWithRetry(mockOperation, context);
        jest.runAllTimers();
        await promise;
      } catch (e) {
        // Expected to throw
      }
    });
    
    expect(logError).toHaveBeenCalledWith(error, expect.objectContaining({
      component: 'TestComponent',
      method: 'testMethod',
      userId: '12345'
    }));
  });

  test('should calculate correct backoff delays', async () => {
    const error = new Error('Test error');
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
