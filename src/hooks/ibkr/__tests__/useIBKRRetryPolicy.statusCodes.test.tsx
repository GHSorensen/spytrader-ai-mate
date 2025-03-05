
import { renderHook, act } from '@testing-library/react-hooks';
import { useIBKRRetryPolicy } from '../useIBKRRetryPolicy';
import { logError } from '@/lib/errorMonitoring';
import { setupRetryPolicyTest } from './utils/retryPolicyTestUtils';

describe('useIBKRRetryPolicy HTTP Status Codes', () => {
  setupRetryPolicyTest();

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

  test('should not retry on non-retriable errors', async () => {
    const nonRetriableError = new Error('Bad Request');
    (nonRetriableError as any).status = 400; // HTTP 400 is typically not retriable
    
    const mockOperation = jest.fn().mockRejectedValue(nonRetriableError);
    
    const { result } = renderHook(() => useIBKRRetryPolicy({
      retryOnCodes: [429, 503, 504]
    }));
    
    await act(async () => {
      try {
        await result.current.executeWithRetry(mockOperation);
        // If the promise doesn't reject, we should fail the test
        expect('This should not be reached').toBe('Promise should have rejected');
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
});
