
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';
import { logError } from '@/lib/errorMonitoring';

// Mock the error logging
jest.mock('@/lib/errorMonitoring', () => ({
  logError: jest.fn(),
}));

describe('useIBKRRetryPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should execute operation successfully without retries', async () => {
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

  test('should retry failed operation up to maxRetries', async () => {
    const error = new Error('Test error');
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries: 3,
      initialDelay: 100,
      backoffFactor: 2
    }));
    
    let operationResult;
    await act(async () => {
      // Start the operation
      const promise = result.current.executeWithRetry(mockOperation);
      
      // Fast-forward past all retry delays
      jest.runAllTimers();
      
      operationResult = await promise;
    });
    
    expect(operationResult).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(3);
    expect(result.current.retryCount).toBe(2);
    expect(result.current.isRetrying).toBe(false);
  });

  test('should throw error after exhausting all retries', async () => {
    const error = new Error('Persistent error');
    const mockOperation = jest.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      maxRetries: 2,
      initialDelay: 50
    }));
    
    await act(async () => {
      try {
        const promise = result.current.executeWithRetry(mockOperation);
        jest.runAllTimers();
        await promise;
        // Should not reach here
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBe(error);
        expect(mockOperation).toHaveBeenCalledTimes(2);
        expect(result.current.retryCount).toBe(2);
        expect(result.current.lastError).toBe(error);
        expect(result.current.isRetrying).toBe(false);
      }
    });
    
    // Error should be logged for each attempt
    expect(logError).toHaveBeenCalledTimes(2);
  });

  test('should reset retry state when requested', async () => {
    const error = new Error('Test error');
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

  test('should include context in error logs', async () => {
    const error = new Error('Context error');
    const mockOperation = jest.fn().mockRejectedValue(error);
    const context = { component: 'TestComponent', method: 'testMethod' };
    
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
    
    expect(logError).toHaveBeenCalledWith(error, {
      ...context,
      retryAttempt: 1,
      maxRetries: 1
    });
  });
});
